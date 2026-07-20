"""
DebtProof — Loan API Views
Full CRUD for loans + dashboard aggregations.
"""
import logging
import calendar
from decimal import Decimal
from datetime import date
from django.db.models import Sum, Count, Q, QuerySet
from rest_framework import generics, status, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.loans.models import Loan, LoanStatus
from apps.payments.models import Payment, PaymentStatus
from apps.core.pagination import StandardResultsSetPagination
from .serializers import LoanSerializer, LoanListSerializer

logger = logging.getLogger(__name__)

class P2PMarketplaceView(generics.ListAPIView):
    """
    GET /api/v1/loans/marketplace/
    Returns all escrow loans that are pending funding (lender_wallet is empty).
    """
    permission_classes = [IsAuthenticated]
    serializer_class = LoanListSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ["created_at", "principal_amount"]
    ordering = ["-created_at"]

    def get_queryset(self) -> QuerySet:
        # Exclude loans created by the requesting user so they don't fund their own loan
        return Loan.objects.filter(
            is_escrow=True,
            lender_wallet=""
        ).exclude(user=self.request.user)


class LoanListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/v1/loans/        — List authenticated user's loans (search, filter, sort)
    POST /api/v1/loans/        — Create a new loan
    """

    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "lender_name", "account_number"]
    ordering_fields = ["created_at", "principal_amount", "outstanding_amount", "start_date", "name"]
    ordering = ["-created_at"]

    def get_queryset(self) -> QuerySet:
        qs = Loan.objects.filter(user=self.request.user)

        # Status filter
        status_filter = self.request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)

        # Loan type filter
        loan_type = self.request.query_params.get("loan_type")
        if loan_type:
            qs = qs.filter(loan_type=loan_type)

        # Overdue filter
        overdue = self.request.query_params.get("overdue")
        if overdue == "true":
            qs = qs.filter(
                status=LoanStatus.ACTIVE,
                next_emi_date__lt=date.today(),
            )

        return qs

    def get_serializer_class(self):
        if self.request.method == "GET":
            return LoanListSerializer
        return LoanSerializer

    def create(self, request: Request, *args, **kwargs) -> Response:
        serializer = LoanSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        loan = serializer.save()
        logger.info("Loan created: %s by %s", loan.name, request.user.email)
        return Response(
            {"success": True, "message": "Loan created successfully.", "loan": LoanSerializer(loan, context={"request": request}).data},
            status=status.HTTP_201_CREATED,
        )

    def list(self, request: Request, *args, **kwargs) -> Response:
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response({"success": True, "results": serializer.data})


class LoanRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/v1/loans/{id}/  — Retrieve loan detail
    PATCH  /api/v1/loans/{id}/  — Update loan
    DELETE /api/v1/loans/{id}/  — Delete loan (only if no payments)
    """

    permission_classes = [IsAuthenticated]
    serializer_class = LoanSerializer
    http_method_names = ["get", "patch", "delete", "head", "options"]

    def get_queryset(self) -> QuerySet:
        return Loan.objects.filter(user=self.request.user)

    def retrieve(self, request: Request, *args, **kwargs) -> Response:
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({"success": True, "loan": serializer.data})

    def partial_update(self, request: Request, *args, **kwargs) -> Response:
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        loan = serializer.save()
        logger.info("Loan updated: %s by %s", loan.name, request.user.email)
        return Response(
            {"success": True, "message": "Loan updated successfully.", "loan": serializer.data}
        )

    def destroy(self, request: Request, *args, **kwargs) -> Response:
        instance = self.get_object()
        if instance.payments.exists():
            return Response(
                {
                    "success": False,
                    "error": {
                        "code": "LOAN_HAS_PAYMENTS",
                        "message": "Cannot delete a loan that has payment records. Delete the payments first.",
                    },
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        loan_name = instance.name
        instance.delete()
        logger.info("Loan deleted: %s by %s", loan_name, request.user.email)
        return Response(
            {"success": True, "message": "Loan deleted successfully."},
            status=status.HTTP_200_OK,
        )


class LoanDashboardView(APIView):
    """
    GET /api/v1/loans/dashboard/
    Returns aggregated statistics for the authenticated user's dashboard.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request: Request) -> Response:
        from apps.payments.models import Payment
        from apps.payments.api.serializers import PaymentListSerializer

        user = request.user
        loans = Loan.objects.filter(user=user)

        # Basic counts
        total_loans = loans.count()
        active_loans = loans.filter(status=LoanStatus.ACTIVE).count()
        closed_loans = loans.filter(status=LoanStatus.CLOSED).count()
        defaulted_loans = loans.filter(status=LoanStatus.DEFAULTED).count()

        # Financial totals
        agg = loans.filter(status=LoanStatus.ACTIVE).aggregate(
            total_outstanding=Sum("outstanding_amount"),
            total_principal_active=Sum("principal_amount"),
        )
        total_outstanding = float(agg["total_outstanding"] or 0)
        total_principal_active = float(agg["total_principal_active"] or 0)
        total_paid_active = total_principal_active - total_outstanding

        # Total interest paid across all loans
        total_interest_paid = float(
            Payment.objects.filter(
                loan__user=user,
                status="confirmed",
            ).aggregate(total=Sum("interest_component"))["total"] or 0
        )

        all_agg = loans.aggregate(
            total_principal_all=Sum("principal_amount"),
        )
        total_principal_all = float(all_agg["total_principal_all"] or 0)

        # Upcoming EMI
        upcoming_loan = (
            loans.filter(
                status=LoanStatus.ACTIVE,
                next_emi_date__gte=date.today(),
            )
            .order_by("next_emi_date")
            .first()
        )
        upcoming_emi_amount = float(upcoming_loan.monthly_emi) if upcoming_loan else 0
        upcoming_emi_date = str(upcoming_loan.next_emi_date) if upcoming_loan else None

        # Overdue loans
        overdue_count = loans.filter(
            status=LoanStatus.ACTIVE,
            next_emi_date__lt=date.today(),
        ).count()

        # Recent payments (last 10 across all loans)
        recent_payments = Payment.objects.filter(
            loan__user=user
        ).select_related("loan", "receipt").order_by("-payment_date", "-created_at")[:10]

        # Loan type distribution (for chart)
        type_distribution = list(
            loans.values("loan_type").annotate(count=Count("id")).order_by("-count")
        )

        # Monthly payment trend (last 6 months)
        from django.db.models.functions import TruncMonth
        from datetime import timedelta

        six_months_ago = date.today().replace(day=1)
        # Go back 6 months
        for _ in range(5):
            first_of_month = six_months_ago.replace(day=1)
            # Go back one month
            if first_of_month.month == 1:
                six_months_ago = first_of_month.replace(year=first_of_month.year - 1, month=12)
            else:
                six_months_ago = first_of_month.replace(month=first_of_month.month - 1)

        monthly_trend = list(
            Payment.objects.filter(
                loan__user=user,
                status="confirmed",
                payment_date__gte=six_months_ago,
            )
            .annotate(month=TruncMonth("payment_date"))
            .values("month")
            .annotate(total=Sum("amount"), count=Count("id"))
            .order_by("month")
        )

        monthly_trend_serialized = [
            {
                "month": str(item["month"])[:7],  # YYYY-MM
                "total": float(item["total"]),
                "count": item["count"],
            }
            for item in monthly_trend
        ]

        # ── Dashboard V2 Projections & Simulations ───────────────────
        # Define simulation helper inside get
        def simulate_payoff(active_loans_list, extra_monthly=0.0, sorting_key=None):
            loans_state = []
            for l in active_loans_list:
                balance = float(l.outstanding_amount)
                rate = (float(l.interest_rate) / 12.0 / 100.0)
                emi = float(l.monthly_emi)
                
                # Prevent division by zero or infinite loop: EMI must cover interest
                min_emi = balance * rate + 10.0
                if emi < min_emi:
                    emi = max(emi, min_emi + (balance * 0.01))
                
                loans_state.append({
                    'id': str(l.id),
                    'balance': balance,
                    'rate': rate,
                    'emi': emi
                })
                
            months = 0
            total_interest = 0.0
            max_months = 360  # 30 years cap
            
            while any(l['balance'] > 0.01 for l in loans_state) and months < max_months:
                months += 1
                
                # Accrue interest first
                for l in loans_state:
                    if l['balance'] > 0:
                        interest = l['balance'] * l['rate']
                        l['balance'] += interest
                        total_interest += interest
                
                # Pay minimums
                available_budget = extra_monthly
                for l in loans_state:
                    if l['balance'] <= 0:
                        continue
                    payment = min(l['emi'], l['balance'])
                    l['balance'] -= payment
                    if payment < l['emi']:
                        available_budget += (l['emi'] - payment)
                
                # Apply extra payment
                if available_budget > 0:
                    if sorting_key == "snowball":
                        target_loans = sorted([l for l in loans_state if l['balance'] > 0], key=lambda x: x['balance'])
                    elif sorting_key == "avalanche":
                        target_loans = sorted([l for l in loans_state if l['balance'] > 0], key=lambda x: -x['rate'])
                    else:
                        target_loans = [l for l in loans_state if l['balance'] > 0]
                        
                    for target in target_loans:
                        if target['balance'] <= 0:
                            continue
                        payment = min(available_budget, target['balance'])
                        target['balance'] -= payment
                        available_budget -= payment
                        if available_budget <= 0:
                            break
                            
            return months, total_interest

        def months_to_date_string(months_count):
            if months_count == 0:
                return None
            today = date.today()
            future_year = today.year + (today.month + months_count - 1) // 12
            future_month = (today.month + months_count - 1) % 12 + 1
            return f"{future_year}-{future_month:02d}"

        # Calculate metrics
        active_loans_qs = loans.filter(status=LoanStatus.ACTIVE)
        monthly_interest_burn = 0.0
        for loan in active_loans_qs:
            monthly_interest_burn += float(loan.outstanding_amount) * (float(loan.interest_rate) / 12.0 / 100.0)

        active_loans_list = list(active_loans_qs)
        
        # 1. Baseline simulation (extra = 0)
        baseline_months, baseline_interest = simulate_payoff(active_loans_list, extra_monthly=0.0)
        baseline_date = months_to_date_string(baseline_months)
        
        # 2. Snowball simulation (extra = 5000)
        extra_amount = 5000.0
        snowball_months, snowball_interest = simulate_payoff(active_loans_list, extra_monthly=extra_amount, sorting_key="snowball")
        snowball_date = months_to_date_string(snowball_months)
        
        # 3. Avalanche simulation (extra = 5000)
        avalanche_months, avalanche_interest = simulate_payoff(active_loans_list, extra_monthly=extra_amount, sorting_key="avalanche")
        avalanche_date = months_to_date_string(avalanche_months)
        
        # Projected debt-free date is baseline
        projected_debt_free_date = baseline_date
        
        # Calculate savings
        snowball_interest_saved = max(0.0, baseline_interest - snowball_interest)
        snowball_months_saved = max(0, baseline_months - snowball_months)
        
        avalanche_interest_saved = max(0.0, baseline_interest - avalanche_interest)
        avalanche_months_saved = max(0, baseline_months - avalanche_months)

        return Response(
            {
                "success": True,
                "dashboard": {
                    "total_loans": total_loans,
                    "active_loans": active_loans,
                    "closed_loans": closed_loans,
                    "defaulted_loans": defaulted_loans,
                    "total_outstanding": total_outstanding,
                    "total_principal_active": total_principal_active,
                    "total_paid_active": total_paid_active,
                    "total_interest_paid": total_interest_paid,
                    "total_principal_all": total_principal_all,
                    "upcoming_emi_amount": upcoming_emi_amount,
                    "upcoming_emi_date": upcoming_emi_date,
                    "overdue_count": overdue_count,
                    "type_distribution": type_distribution,
                    "monthly_trend": monthly_trend_serialized,
                    "recent_payments": PaymentListSerializer(
                        recent_payments, many=True, context={"request": request}
                    ).data,
                    "projected_debt_free_date": projected_debt_free_date,
                    "monthly_interest_burn": monthly_interest_burn,
                    "simulations": {
                        "baseline": {
                            "debt_free_date": baseline_date,
                            "total_interest": baseline_interest,
                            "months": baseline_months
                        },
                        "snowball": {
                            "debt_free_date": snowball_date,
                            "total_interest": snowball_interest,
                            "interest_saved": snowball_interest_saved,
                            "months_saved": snowball_months_saved
                        },
                        "avalanche": {
                            "debt_free_date": avalanche_date,
                            "total_interest": avalanche_interest,
                            "interest_saved": avalanche_interest_saved,
                            "months_saved": avalanche_months_saved
                        }
                    }
                },
            }
        )


class EMICalendarView(APIView):
    """
    GET /api/v1/loans/calendar/?year=YYYY&month=MM
    Returns EMI events for every active loan in the requested month.
    Each event status is resolved as: paid | overdue | upcoming.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = date.today()
        try:
            year = int(request.query_params.get("year", today.year))
            month = int(request.query_params.get("month", today.month))
            if not (1 <= month <= 12):
                raise ValueError
        except (ValueError, TypeError):
            return Response({"error": "Invalid year or month parameter."}, status=400)

        # Days in the requested month
        _, days_in_month = calendar.monthrange(year, month)
        month_start = date(year, month, 1)
        month_end = date(year, month, days_in_month)

        # Fetch all active loans for this user
        active_loans = Loan.objects.filter(
            user=request.user,
            status=LoanStatus.ACTIVE
        ).select_related("user")

        # All confirmed payments this user made in the requested month
        paid_loan_ids = set(
            Payment.objects.filter(
                loan__user=request.user,
                payment_date__year=year,
                payment_date__month=month,
                status=PaymentStatus.CONFIRMED
            ).values_list("loan_id", flat=True)
        )

        events = []
        total_emi = 0.0
        overdue_count = 0
        upcoming_count = 0
        paid_count = 0

        for loan in active_loans:
            # Determine due date: use next_emi_date if it falls in this month,
            # otherwise derive from start_date day-of-month.
            emi_day = loan.start_date.day
            # Clamp to valid day in this month
            emi_day = min(emi_day, days_in_month)
            due_date = date(year, month, emi_day)

            # Resolve status
            if str(loan.id) in {str(pid) for pid in paid_loan_ids}:
                event_status = "paid"
                paid_count += 1
            elif due_date < today:
                event_status = "overdue"
                overdue_count += 1
            else:
                event_status = "upcoming"
                upcoming_count += 1

            total_emi += float(loan.monthly_emi)

            events.append({
                "loan_id": str(loan.id),
                "loan_name": loan.name,
                "lender_name": loan.lender_name,
                "loan_type": loan.loan_type,
                "emi_amount": float(loan.monthly_emi),
                "due_date": due_date.isoformat(),
                "status": event_status
            })

        # Sort events by due_date
        events.sort(key=lambda e: e["due_date"])

        return Response({
            "success": True,
            "year": year,
            "month": month,
            "calendar": {
                "events": events,
                "month_summary": {
                    "total_emi": total_emi,
                    "overdue_count": overdue_count,
                    "upcoming_count": upcoming_count,
                    "paid_count": paid_count
                }
            }
        })


import csv
from django.http import HttpResponse

class ExportLoansCSVView(APIView):
    """
    GET /api/v1/loans/export/csv/
    Exports all active and closed loans for the authenticated user as a CSV file.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request: Request) -> HttpResponse:
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="debtproof_loans_ledger.csv"'

        writer = csv.writer(response)
        writer.writerow([
            "Loan ID",
            "Loan Name",
            "Lender Name",
            "Loan Type",
            "Principal Amount (INR)",
            "Outstanding Amount (INR)",
            "Repaid Amount (INR)",
            "Progress %",
            "Interest Rate (%)",
            "Monthly EMI (INR)",
            "Start Date",
            "End Date",
            "Status",
        ])

        loans = Loan.objects.filter(user=request.user).order_by("-created_at")
        for loan in loans:
            writer.writerow([
                str(loan.id),
                loan.name,
                loan.lender_name,
                loan.get_loan_type_display(),
                float(loan.principal_amount),
                float(loan.outstanding_amount),
                float(loan.paid_amount),
                round(loan.repayment_progress_percent, 1),
                float(loan.interest_rate),
                float(loan.monthly_emi),
                loan.start_date.isoformat(),
                loan.end_date.isoformat(),
                loan.get_status_display(),
            ])

        return response


class LoanSimulationView(APIView):
    """
    GET /api/v1/loans/simulate/
    Accepts extra_monthly query param and recalculates debt repayment projections.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request: Request) -> Response:
        user = request.user
        loans = Loan.objects.filter(user=user)
        active_loans_qs = loans.filter(status=LoanStatus.ACTIVE)
        active_loans_list = list(active_loans_qs)

        try:
            extra_monthly = float(request.query_params.get("extra_monthly", 5000.0))
        except (ValueError, TypeError):
            extra_monthly = 5000.0

        def simulate_payoff(active_loans, extra_monthly_amount=0.0, sorting_key=None):
            loans_state = []
            for l in active_loans:
                balance = float(l.outstanding_amount)
                rate = (float(l.interest_rate) / 12.0 / 100.0)
                emi = float(l.monthly_emi)
                min_emi = balance * rate + 10.0
                if emi < min_emi:
                    emi = max(emi, min_emi + (balance * 0.01))
                
                loans_state.append({
                    'id': str(l.id),
                    'name': l.name,
                    'balance': balance,
                    'rate': rate,
                    'emi': emi
                })
                
            months = 0
            total_interest = 0.0
            max_months = 360
            
            # For progress logging over time
            history = []
            
            while any(l['balance'] > 0.01 for l in loans_state) and months < max_months:
                months += 1
                total_balance_before = sum(max(0, l['balance']) for l in loans_state)
                history.append({
                    "month": months,
                    "outstanding": total_balance_before
                })

                # Interest accrues
                for l in loans_state:
                    if l['balance'] > 0:
                        interest = l['balance'] * l['rate']
                        l['balance'] += interest
                        total_interest += interest

                # Standard EMI
                available_budget = extra_monthly_amount
                for l in loans_state:
                    if l['balance'] <= 0:
                        continue
                    payment = min(l['emi'], l['balance'])
                    l['balance'] -= payment
                    if payment < l['emi']:
                        available_budget += (l['emi'] - payment)

                # Extra Payment
                if available_budget > 0:
                    if sorting_key == "snowball":
                        target_loans = sorted([l for l in loans_state if l['balance'] > 0], key=lambda x: x['balance'])
                    elif sorting_key == "avalanche":
                        target_loans = sorted([l for l in loans_state if l['balance'] > 0], key=lambda x: -x['rate'])
                    else:
                        target_loans = [l for l in loans_state if l['balance'] > 0]
                        
                    for target in target_loans:
                        if target['balance'] <= 0:
                            continue
                        payment = min(available_budget, target['balance'])
                        target['balance'] -= payment
                        available_budget -= payment
                        if available_budget <= 0:
                            break
                            
            # Add final point
            history.append({
                "month": months + 1,
                "outstanding": 0.0
            })
            return months, total_interest, history

        def months_to_date_string(months_count):
            if months_count == 0:
                return None
            today = date.today()
            future_year = today.year + (today.month + months_count - 1) // 12
            future_month = (today.month + months_count - 1) % 12 + 1
            return f"{future_year}-{future_month:02d}"

        baseline_months, baseline_interest, baseline_hist = simulate_payoff(active_loans_list, extra_monthly_amount=0.0)
        snowball_months, snowball_interest, snowball_hist = simulate_payoff(active_loans_list, extra_monthly_amount=extra_monthly, sorting_key="snowball")
        avalanche_months, avalanche_interest, avalanche_hist = simulate_payoff(active_loans_list, extra_monthly_amount=extra_monthly, sorting_key="avalanche")

        return Response({
            "success": True,
            "extra_monthly": extra_monthly,
            "simulations": {
                "baseline": {
                    "debt_free_date": months_to_date_string(baseline_months),
                    "total_interest": baseline_interest,
                    "months": baseline_months,
                    "history": baseline_hist
                },
                "snowball": {
                    "debt_free_date": months_to_date_string(snowball_months),
                    "total_interest": snowball_interest,
                    "interest_saved": max(0.0, baseline_interest - snowball_interest),
                    "months_saved": max(0, baseline_months - snowball_months),
                    "history": snowball_hist
                },
                "avalanche": {
                    "debt_free_date": months_to_date_string(avalanche_months),
                    "total_interest": avalanche_interest,
                    "interest_saved": max(0.0, baseline_interest - avalanche_interest),
                    "months_saved": max(0, baseline_months - avalanche_months),
                    "history": avalanche_hist
                }
            }
        })


