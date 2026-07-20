"""
DebtProof — Unified Reports API view
Handles exporting Loans, Payments, Assets, Net Worth and Credit Cards.
Supports formats: CSV, XLS (TSV formatted), and PDF (JSON-Print ready preview formats).
"""
import csv
from django.http import HttpResponse, JsonResponse
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from django.db.models import Sum

from apps.loans.models import Loan
from apps.payments.models import Payment
from apps.assets.models import Asset, Liability
from apps.credit_cards.models import CreditCard


class UnifiedExportView(APIView):
    """
    GET /api/v1/payments/export/unified/?report_type=payments|loans|assets|credit_cards|net_worth&format=csv|xls|pdf
    Generates unified customizable downloads. Supports query-parameter token fallback for PDF windows.
    """
    def get(self, request: Request) -> HttpResponse:
        token = request.query_params.get("token")
        if token:
            from rest_framework_simplejwt.authentication import JWTAuthentication
            try:
                auth = JWTAuthentication()
                validated_token = auth.get_validated_token(token)
                user = auth.get_user(validated_token)
            except Exception:
                return HttpResponse("Unauthorized token key.", status=401)
        else:
            if not request.user.is_authenticated:
                return HttpResponse("Authentication credentials were not provided.", status=401)
            user = request.user

        report_type = request.query_params.get("report_type", "payments")
        export_format = request.query_params.get("format", "csv")


        # Fetch Data based on report type
        if report_type == "payments":
            headers = ["Payment Date", "Loan Name", "Lender", "Amount (INR)", "Principal component", "Interest component", "Method", "Reference", "Status"]
            payments = Payment.objects.filter(loan__user=user).select_related("loan").order_by("-payment_date")
            rows = [[
                p.payment_date.isoformat(),
                p.loan.name,
                p.loan.lender_name,
                float(p.amount),
                float(p.principal_component),
                float(p.interest_component),
                p.get_payment_method_display(),
                p.reference_number,
                p.get_status_display()
            ] for p in payments]

        elif report_type == "loans":
            headers = ["Loan Name", "Lender", "Type", "Principal", "Outstanding", "Repaid", "APR %", "EMI (INR)", "Start Date", "Status"]
            loans = Loan.objects.filter(user=user).order_by("-created_at")
            rows = [[
                l.name,
                l.lender_name,
                l.get_loan_type_display(),
                float(l.principal_amount),
                float(l.outstanding_amount),
                float(l.paid_amount),
                float(l.interest_rate),
                float(l.monthly_emi),
                l.start_date.isoformat(),
                l.get_status_display()
            ] for l in loans]

        elif report_type == "assets":
            headers = ["Asset Name", "Category", "Class", "Value (INR)", "Created Date"]
            assets = Asset.objects.filter(user=user).order_by("-created_at")
            rows = [[
                a.name,
                a.get_asset_type_display(),
                a.get_asset_class_display(),
                float(a.value),
                a.created_at.date().isoformat()
            ] for a in assets]

        elif report_type == "credit_cards":
            headers = ["Card Name", "Bank", "Limit (INR)", "Outstanding", "APR %", "Min Due", "Statement Date", "Due Date", "Status"]
            cards = CreditCard.objects.filter(user=user).order_by("-created_at")
            rows = [[
                c.card_name,
                c.bank_name,
                float(c.credit_limit),
                float(c.current_outstanding),
                float(c.interest_rate),
                float(c.minimum_due),
                c.statement_date,
                c.due_date,
                c.get_status_display()
            ] for c in cards]

        elif report_type == "net_worth":
            headers = ["Section", "Classification Type", "Amount (INR)"]
            total_assets = float(Asset.objects.filter(user=user).aggregate(total=Sum("value"))["total"] or 0)
            total_loans = float(Loan.objects.filter(user=user, status="active").aggregate(total=Sum("outstanding_amount"))["total"] or 0)
            total_cc = float(CreditCard.objects.filter(user=user).aggregate(total=Sum("current_outstanding"))["total"] or 0)
            total_custom_liabs = float(Liability.objects.filter(user=user).aggregate(total=Sum("value"))["total"] or 0)

            rows = [
                ["Assets", "Total Combined Assets", total_assets],
                ["Liabilities", "Active Bank Loans Debt", total_loans],
                ["Liabilities", "Credit Cards Outstandings", total_cc],
                ["Liabilities", "Custom Bills & Dues", total_custom_liabs],
                ["Calculations", "NET WORTH COVERAGE", total_assets - (total_loans + total_cc + total_custom_liabs)]
            ]

        else:
            return HttpResponse("Invalid report type.", status=400)

        # ── Output Formatter Switch ──────────────────────────────────────────

        # PDF format trigger (simulate PDF output by rendering standard HTML Print Preview document)
        if export_format == "pdf":
            html_content = f"""
            <html>
            <head>
                <style>
                    body {{ font-family: sans-serif; padding: 30px; color: #1e293b; }}
                    h2 {{ color: #2563eb; margin-bottom: 5px; }}
                    p {{ font-size: 11px; color: #64748b; margin-top: 0; margin-bottom: 25px; }}
                    table {{ width: 100%; border-collapse: collapse; margin-top: 15px; }}
                    th {{ background: #f1f5f9; text-align: left; padding: 10px; font-size: 11px; text-transform: uppercase; }}
                    td {{ padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; }}
                </style>
            </head>
            <body onload="window.print()">
                <h2>{report_type.replace('_', ' ').upper()} STATEMENT REPORT</h2>
                <p>Generated by DebtProof SaaS Platform for {user.email}</p>
                <table>
                    <thead>
                        <tr>{"".join(f"<th>{h}</th>" for h in headers)}</tr>
                    </thead>
                    <tbody>
                        {"".join(f"<tr>{''.join(f'<td>{val}</td>' for val in row)}</tr>" for row in rows)}
                    </tbody>
                </table>
            </body>
            </html>
            """
            response = HttpResponse(html_content, content_type="text/html")
            return response

        # XLS Export Option (uses Tab Separated Values compatible with Excel)
        elif export_format == "xls":
            response = HttpResponse(content_type="application/vnd.ms-excel")
            response["Content-Disposition"] = f'attachment; filename="debtproof_{report_type}.xls"'
            # Write TSV format
            content = "\t".join(headers) + "\n"
            for row in rows:
                content += "\t".join(str(val) for val in row) + "\n"
            response.write(content)
            return response

        # Default CSV Format Export
        else:
            response = HttpResponse(content_type="text/csv")
            response["Content-Disposition"] = f'attachment; filename="debtproof_{report_type}.csv"'
            writer = csv.writer(response)
            writer.writerow(headers)
            for row in rows:
                writer.writerow(row)
            return response
