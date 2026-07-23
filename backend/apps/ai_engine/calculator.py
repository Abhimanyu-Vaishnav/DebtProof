"""
DebtProof — AI Financial Query Engine
Real-data calculations for the AI assistant. NO mock responses.
Every answer is derived from actual database records.
"""
import logging
from decimal import Decimal
from datetime import date, timedelta

logger = logging.getLogger(__name__)


class AIFinancialEngine:
    """
    Processes natural language financial questions and returns
    answers computed from real user DB data.
    """

    INTENT_MAP = {
        "interest": ["interest", "paid", "cost", "how much interest", "total interest"],
        "payoff_order": ["close first", "payoff", "pay off", "which loan", "priority", "order"],
        "debt_ratio": ["debt ratio", "debt-to-income", "dti", "ratio", "burden", "emi burden"],
        "savings": ["save", "savings", "reduce", "save money", "extra emi"],
        "snowball": ["snowball", "smallest", "least balance"],
        "avalanche": ["avalanche", "highest interest", "most expensive"],
        "credit_cards": ["card", "credit card", "limit", "utilization", "card debt"],
        "net_worth": ["net worth", "assets", "wealth", "asset"],
        "monthly_emi": ["emi", "monthly payment", "installment", "how much per month", "due date"],
        "summary": ["summary", "overview", "report", "status", "everything", "financial health"],
    }

    def __init__(self, user):
        self.user = user

    def process_query(self, question: str) -> dict:
        """Detect intent and compute real answer."""
        q_lower = question.lower()
        intent = self._detect_intent(q_lower)

        handlers = {
            "interest": self._calc_total_interest,
            "payoff_order": self._calc_payoff_priority,
            "debt_ratio": self._calc_debt_ratio,
            "savings": self._calc_savings_opportunity,
            "summary": self._financial_summary,
            "snowball": self._snowball_order,
            "avalanche": self._avalanche_order,
            "credit_cards": self._calc_credit_cards,
            "monthly_emi": self._calc_monthly_emi,
            "net_worth": self._calc_net_worth,
        }

        handler = handlers.get(intent, self._financial_summary)
        return handler()

    def _detect_intent(self, q: str) -> str:
        for intent, keywords in self.INTENT_MAP.items():
            if any(k in q for k in keywords):
                return intent
        return "summary"

    def _get_active_loans(self):
        from apps.loans.models import Loan
        return list(Loan.objects.filter(user=self.user, status="active").prefetch_related("payments"))

    def _get_all_payments(self):
        from apps.payments.models import Payment
        return Payment.objects.filter(loan__user=self.user)

    def _calc_total_interest(self) -> dict:
        payments = self._get_all_payments()
        total_interest = sum(p.interest_component or Decimal("0") for p in payments)
        total_paid = sum(p.amount for p in payments)
        principal_paid = total_paid - total_interest

        return {
            "answer": (
                f"You have paid a total of ₹{total_interest:,.0f} in interest across all your loans. "
                f"Out of ₹{total_paid:,.0f} total paid, ₹{principal_paid:,.0f} went to principal reduction."
            ),
            "data": {
                "total_interest_paid": float(total_interest),
                "total_amount_paid": float(total_paid),
                "principal_paid": float(principal_paid),
            },
            "intent": "interest",
        }

    def _calc_payoff_priority(self) -> dict:
        loans = self._get_active_loans()
        if not loans:
            return {"answer": "You have no active loans. Great financial health!", "data": {}, "intent": "payoff_order"}

        # Avalanche: highest interest rate first = maximum savings
        by_rate = sorted(loans, key=lambda l: l.interest_rate or Decimal("0"), reverse=True)
        top = by_rate[0]

        answer = (
            f"Close **{top.lender or 'Loan ' + top.loan_type}** first (interest rate: {top.interest_rate}% p.a.). "
            f"This saves the most interest over time. Outstanding: ₹{top.outstanding_amount:,.0f}."
        )
        if len(by_rate) > 1:
            second = by_rate[1]
            answer += f" Then focus on **{second.lender or 'Loan 2'}** ({second.interest_rate}% p.a.)."

        return {
            "answer": answer,
            "data": {"priority_order": [{"loan_id": str(l.id), "lender": l.lender_name, "rate": float(l.interest_rate or 0)} for l in by_rate]},
            "intent": "payoff_order",
        }

    def _calc_debt_ratio(self) -> dict:
        loans = self._get_active_loans()
        total_outstanding = sum(l.outstanding_amount or Decimal("0") for l in loans)
        total_emi = sum(l.monthly_emi or Decimal("0") for l in loans)

        ratio_text = "healthy (below 30%)" if total_emi < 30000 else "moderate (30–50%)" if total_emi < 50000 else "high (above 50%)"

        return {
            "answer": (
                f"Your total outstanding debt is ₹{total_outstanding:,.0f} across {len(loans)} active loan(s). "
                f"Monthly EMI commitment is ₹{total_emi:,.0f}. "
                f"Your debt burden appears **{ratio_text}**."
            ),
            "data": {
                "total_outstanding": float(total_outstanding),
                "monthly_emi_total": float(total_emi),
                "active_loan_count": len(loans),
            },
            "intent": "debt_ratio",
        }

    def _calc_savings_opportunity(self) -> dict:
        loans = self._get_active_loans()
        if not loans:
            return {"answer": "No active loans found. Consider channeling savings to investments!", "data": {}, "intent": "savings"}

        # Find highest rate loan
        high_rate = max(loans, key=lambda l: l.interest_rate or Decimal("0"))
        savings_if_closed = (high_rate.outstanding_amount or Decimal("0")) * (high_rate.interest_rate or Decimal("0")) / 100

        return {
            "answer": (
                f"Closing **{high_rate.lender or 'your highest-rate loan'}** "
                f"(₹{high_rate.outstanding_amount:,.0f} at {high_rate.interest_rate}% p.a.) "
                f"could save approximately ₹{savings_if_closed:,.0f} in annual interest. "
                f"Consider making extra payments towards this loan to accelerate payoff."
            ),
            "data": {
                "high_rate_loan": str(high_rate.id),
                "estimated_annual_savings": float(savings_if_closed),
            },
            "intent": "savings",
        }

    def _snowball_order(self) -> dict:
        loans = self._get_active_loans()
        ordered = sorted(loans, key=lambda l: l.outstanding_amount or Decimal("0"))
        order_text = ", ".join([f"{l.lender_name or 'Loan'} (₹{l.outstanding_amount:,.0f})" for l in ordered])

        return {
            "answer": f"**Debt Snowball Strategy** — Pay smallest balance first to build momentum: {order_text}.",
            "data": {"snowball_order": [str(l.id) for l in ordered]},
            "intent": "snowball",
        }

    def _avalanche_order(self) -> dict:
        loans = self._get_active_loans()
        ordered = sorted(loans, key=lambda l: l.interest_rate or Decimal("0"), reverse=True)
        order_text = ", ".join([f"{l.lender_name or 'Loan'} ({l.interest_rate}%)" for l in ordered])

        return {
            "answer": f"**Debt Avalanche Strategy** — Pay highest interest first to minimize total cost: {order_text}.",
            "data": {"avalanche_order": [str(l.id) for l in ordered]},
            "intent": "avalanche",
        }

    def _calc_credit_cards(self) -> dict:
        from apps.credit_cards.models import CreditCard
        cards = list(CreditCard.objects.filter(user=self.user))
        if not cards:
            return {"answer": "You currently have 0 credit cards registered. Add credit cards to monitor utilization!", "data": {}, "intent": "credit_cards"}

        total_limit = sum(c.credit_limit or Decimal("0") for c in cards)
        total_balance = sum(c.current_balance or Decimal("0") for c in cards)
        overall_util = (total_balance / total_limit * 100) if total_limit > 0 else 0

        status_text = "excellent (below 30%)" if overall_util < 30 else "high (above 50%)" if overall_util > 50 else "moderate"
        return {
            "answer": (
                f"💳 You have {len(cards)} credit card(s) registered. "
                f"Total Credit Limit: ₹{total_limit:,.0f} | Current Total Balance: ₹{total_balance:,.0f}. "
                f"Overall Utilization is **{overall_util:.1f}%** ({status_text})."
            ),
            "data": {
                "card_count": len(cards),
                "total_limit": float(total_limit),
                "total_balance": float(total_balance),
                "utilization_percent": float(overall_util),
            },
            "intent": "credit_cards",
        }

    def _calc_monthly_emi(self) -> dict:
        loans = self._get_active_loans()
        total_emi = sum(l.monthly_emi or Decimal("0") for l in loans)
        breakdown = [{"lender": l.lender_name or "Loan", "emi": float(l.monthly_emi or 0)} for l in loans]

        return {
            "answer": f"Your total monthly EMI commitment is ₹{total_emi:,.0f} across {len(loans)} active loan(s).",
            "data": {"total_monthly_emi": float(total_emi), "breakdown": breakdown},
            "intent": "monthly_emi",
        }

    def _calc_net_worth(self) -> dict:
        from apps.assets.models import Asset
        assets = Asset.objects.filter(user=self.user)
        total_assets = sum(a.current_value or Decimal("0") for a in assets)
        loans = self._get_active_loans()
        total_debt = sum(l.outstanding_amount or Decimal("0") for l in loans)
        net_worth = total_assets - total_debt

        emoji = "📈" if net_worth > 0 else "📉"
        return {
            "answer": f"{emoji} Your estimated net worth is ₹{net_worth:,.0f} (Assets: ₹{total_assets:,.0f} — Liabilities: ₹{total_debt:,.0f}).",
            "data": {"net_worth": float(net_worth), "total_assets": float(total_assets), "total_debt": float(total_debt)},
            "intent": "net_worth",
        }

    def _financial_summary(self) -> dict:
        loans = self._get_active_loans()
        payments = self._get_all_payments()
        total_outstanding = sum(l.outstanding_amount or Decimal("0") for l in loans)
        total_emi = sum(l.monthly_emi or Decimal("0") for l in loans)
        total_interest = sum(p.interest_component or Decimal("0") for p in payments)

        return {
            "answer": (
                f"📊 **Your Financial Summary**: "
                f"You have {len(loans)} active loan(s) with total outstanding of ₹{total_outstanding:,.0f}. "
                f"Monthly EMI commitment: ₹{total_emi:,.0f}. "
                f"Total interest paid to date: ₹{total_interest:,.0f}. "
                f"Use specific questions like 'Which loan should I close first?' or 'What is my debt ratio?' for deeper insights."
            ),
            "data": {
                "active_loans": len(loans),
                "total_outstanding": float(total_outstanding),
                "monthly_emi": float(total_emi),
                "total_interest_paid": float(total_interest),
            },
            "intent": "summary",
        }

    def get_dashboard_insights(self) -> list:
        """Generate real-time AI insight cards for the Dashboard."""
        insights = []
        loans = self._get_active_loans()
        payments = self._get_all_payments()

        if loans:
            total_outstanding = sum(l.outstanding_amount or Decimal("0") for l in loans)
            total_emi = sum(l.monthly_emi or Decimal("0") for l in loans)
            insights.append({
                "id": "debt_snapshot",
                "icon": "💰",
                "color": "blue",
                "title": "Debt Snapshot",
                "message": f"₹{total_outstanding:,.0f} outstanding across {len(loans)} loan(s). Monthly EMI: ₹{total_emi:,.0f}.",
                "priority": 1,
            })

            # Highest rate loan warning
            high_rate = max(loans, key=lambda l: l.interest_rate or Decimal("0"))
            if high_rate.interest_rate and high_rate.interest_rate > 15:
                insights.append({
                    "id": "high_rate_warning",
                    "icon": "⚠️",
                    "color": "orange",
                    "title": "High Interest Rate Detected",
                    "message": f"{high_rate.lender or 'A loan'} is charging {high_rate.interest_rate}% p.a. Consider prioritizing this for early closure.",
                    "priority": 2,
                })

        # Monthly interest this year
        from datetime import date
        this_year_payments = [p for p in payments if p.payment_date and p.payment_date.year == date.today().year]
        yearly_interest = sum(p.interest_component or Decimal("0") for p in this_year_payments)
        if yearly_interest > 0:
            insights.append({
                "id": "interest_ytd",
                "icon": "📊",
                "color": "red",
                "title": "Interest Paid This Year",
                "message": f"You have paid ₹{yearly_interest:,.0f} in interest so far this year.",
                "priority": 3,
            })

        if not insights:
            insights.append({
                "id": "no_loans",
                "icon": "✅",
                "color": "green",
                "title": "Debt-Free Status",
                "message": "No active loans! Consider channeling your EMI budget into investments.",
                "priority": 1,
            })

        return sorted(insights, key=lambda x: x["priority"])
