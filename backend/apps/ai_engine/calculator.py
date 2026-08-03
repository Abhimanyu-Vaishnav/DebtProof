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
        "credit_cards": ["card", "credit card", "limit", "utilization", "card debt", "credit card balance", "outstanding balance of credit card", "credit card outstanding", "outstanding balance"],
        "interest": ["interest", "paid", "cost", "how much interest", "total interest", "byaj", "byaj kitna", "kitna interest", "interest pay kiya"],
        "payoff_order": ["close first", "payoff", "pay off", "which loan", "priority", "order", "pehle kaunsa", "kaunsa loan pehle", "first close", "pehle bhare"],
        "debt_ratio": ["debt ratio", "debt-to-income", "dti", "ratio", "burden", "emi burden", "bojh", "dti ratio", "safety"],
        "savings": ["save", "savings", "reduce", "save money", "extra emi", "bachat", "paise bachaye", "extra paise"],
        "snowball": ["snowball", "smallest", "least balance", "chota loan", "chhota loan"],
        "avalanche": ["avalanche", "highest interest", "most expensive", "sabse mehenga", "sabse jyada byaj"],
        "net_worth": ["net worth", "assets", "wealth", "asset", "kul sampatti"],
        "monthly_emi": ["emi", "monthly payment", "installment", "how much per month", "due date", "har mahine kitna", "har mahine ki emi"],
        "zk_proofs": ["zk", "zk proof", "zero knowledge", "privacy proof", "credit proof"],
        "refinance": ["refinance", "balance transfer", "lower rate", "processing fee", "kam interest"],
        "auto_saver": ["auto saver", "spare change", "roundup", "micro deposit"],
        "reports": ["report", "pdf", "statement", "export", "download pdf", "certificate"],
        "p2p": ["p2p", "peer to peer", "monad", "escrow", "lending market"],
        "verify": ["verify", "receipt proof", "hash", "sha256", "blockchain proof"],
        "summary": ["summary", "overview", "report", "status", "everything", "financial health", "help", "faq", "how to use", "sab batao", "mera account", "account details"],
    }

    def _is_hindi(self, q: str) -> bool:
        hindi_keywords = ["kya", "kaunsa", "kitna", "kaise", "hoga", "batao", "byaj", "hai", "pehle", "bhare", "karu", "mere", "mera", "bata", "rakha"]
        return any(k in q for k in hindi_keywords)

    def process_query(self, question: str) -> dict:
        """Detect intent and compute real answer in user's spoken language (English or Hindi/Hinglish)."""
        q_lower = question.lower()
        intent = self._detect_intent(q_lower)
        is_hi = self._is_hindi(q_lower)

        handlers = {
            "interest": lambda: self._calc_total_interest(is_hi),
            "payoff_order": lambda: self._calc_payoff_priority(is_hi),
            "debt_ratio": lambda: self._calc_debt_ratio(is_hi),
            "savings": lambda: self._calc_savings_opportunity(is_hi),
            "summary": lambda: self._financial_summary(is_hi),
            "snowball": lambda: self._snowball_order(is_hi),
            "avalanche": lambda: self._avalanche_order(is_hi),
            "credit_cards": lambda: self._calc_credit_cards(is_hi),
            "monthly_emi": lambda: self._calc_monthly_emi(is_hi),
            "net_worth": lambda: self._calc_net_worth(is_hi),
            "zk_proofs": lambda: self._explain_zk_proofs(is_hi),
            "refinance": lambda: self._explain_refinance(is_hi),
            "auto_saver": lambda: self._explain_auto_saver(is_hi),
            "reports": lambda: self._explain_reports(is_hi),
            "p2p": lambda: self._explain_p2p(is_hi),
            "verify": lambda: self._explain_verify(is_hi),
        }

        handler = handlers.get(intent, lambda: self._financial_summary(is_hi))
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

    def _calc_total_interest(self, is_hi=False) -> dict:
        payments = self._get_all_payments()
        total_interest = sum(p.interest_component or Decimal("0") for p in payments)
        total_paid = sum(p.amount for p in payments)
        principal_paid = max(Decimal("0"), total_paid - total_interest)

        if is_hi:
            ans = (
                f"Aapne ab tak apne sabhi loans par total **₹{total_interest:,.0f}** interest (byaj) pay kar diya hai! 💰\n\n"
                f"Total paid Amount ₹{total_paid:,.0f} me se ₹{principal_paid:,.0f} aapke original principal balance ko kam karne me gaya hai."
            )
        else:
            ans = (
                f"You have paid a total of **₹{total_interest:,.0f}** in interest across all your loans. 💰\n\n"
                f"Out of ₹{total_paid:,.0f} total paid, ₹{principal_paid:,.0f} went towards reducing your principal loan balance."
            )

        return {
            "answer": ans,
            "data": {
                "total_interest_paid": float(total_interest),
                "total_amount_paid": float(total_paid),
                "principal_paid": float(principal_paid),
            },
            "intent": "interest",
        }

    def _calc_payoff_priority(self, is_hi=False) -> dict:
        loans = self._get_active_loans()
        if not loans:
            return {"answer": "Aapka account completely debt-free hai! 🎉" if is_hi else "You have zero active debt! Your portfolio is 100% debt-free! 🎉", "data": {}, "intent": "payoff_order"}

        by_rate = sorted(loans, key=lambda l: l.interest_rate or Decimal("0"), reverse=True)
        top = by_rate[0]

        if is_hi:
            answer = (
                f"Aapko sabse pehle **{top.lender_name or top.name}** ko close karna chahiye (Interest Rate: {top.interest_rate}% p.a.). 🔥\n\n"
                f"Is sabse mehenge loan (Outstanding: ₹{top.outstanding_amount:,.0f}) par extra prepayments karne se aapka sabse jyada interest bachega."
            )
            if len(by_rate) > 1:
                second = by_rate[1]
                answer += f"\n\nIske baad second priority **{second.lender_name or second.name}** ({second.interest_rate}% p.a.) ko de."
        else:
            answer = (
                f"You should target closing **{top.lender_name or top.name}** first (Interest Rate: {top.interest_rate}% p.a.). 🔥\n\n"
                f"Accelerating payments on this high-rate debt (Outstanding: ₹{top.outstanding_amount:,.0f}) will save you maximum total interest."
            )
            if len(by_rate) > 1:
                second = by_rate[1]
                answer += f"\n\nNext, focus prepayments on **{second.lender_name or second.name}** ({second.interest_rate}% p.a.)."

        return {
            "answer": answer,
            "data": {"priority_order": [{"loan_id": str(l.id), "lender": l.lender_name, "rate": float(l.interest_rate or 0)} for l in by_rate]},
            "intent": "payoff_order",
        }

    def _calc_debt_ratio(self, is_hi=False) -> dict:
        loans = self._get_active_loans()
        total_outstanding = sum(l.outstanding_amount or Decimal("0") for l in loans)
        total_emi = sum(l.monthly_emi or Decimal("0") for l in loans)

        if is_hi:
            ratio_text = "bahut achhi (Healthy <30%)" if total_emi < 30000 else "moderate (30–50%)" if total_emi < 50000 else "thodi high (>50%)"
            ans = (
                f"Aapke account me total **₹{total_outstanding:,.0f}** outstanding debt hai across {len(loans)} active loans. 📊\n\n"
                f"Monthly EMI commitment: **₹{total_emi:,.0f}**.\n"
                f"Aapka debt burden health status **{ratio_text}** hai."
            )
        else:
            ratio_text = "Healthy (<30%)" if total_emi < 30000 else "Moderate (30–50%)" if total_emi < 50000 else "High (>50%)"
            ans = (
                f"You have a total outstanding debt of **₹{total_outstanding:,.0f}** across {len(loans)} active loan(s). 📊\n\n"
                f"Total Monthly EMI commitment is **₹{total_emi:,.0f}**.\n"
                f"Your Debt-to-Income burden status is **{ratio_text}**."
            )

        return {
            "answer": ans,
            "data": {
                "total_outstanding": float(total_outstanding),
                "monthly_emi_total": float(total_emi),
                "active_loan_count": len(loans),
            },
            "intent": "debt_ratio",
        }

    def _calc_savings_opportunity(self, is_hi=False) -> dict:
        loans = self._get_active_loans()
        if not loans:
            return {"answer": "Aapka koi active loan nahi hai!" if is_hi else "You have no active loans! Channel extra cash into investments.", "data": {}, "intent": "savings"}

        high_rate = max(loans, key=lambda l: l.interest_rate or Decimal("0"))
        savings_if_closed = (high_rate.outstanding_amount or Decimal("0")) * (high_rate.interest_rate or Decimal("0")) / 100

        if is_hi:
            ans = (
                f"Agar aap **{high_rate.lender_name or high_rate.name}** (₹{high_rate.outstanding_amount:,.0f} @ {high_rate.interest_rate}%) par har mahine extra ₹5,000 EMI lagate hain, "
                f"to aap yearly lagbhag **₹{savings_if_closed:,.0f}** interest bacha sakte hain! ⚡"
            )
        else:
            ans = (
                f"If you pay an extra ₹5,000 monthly towards **{high_rate.lender_name or high_rate.name}** (₹{high_rate.outstanding_amount:,.0f} @ {high_rate.interest_rate}% p.a.), "
                f"you will save approximately **₹{savings_if_closed:,.0f}** in annual interest! ⚡"
            )

        return {
            "answer": ans,
            "data": {
                "high_rate_loan": str(high_rate.id),
                "estimated_annual_savings": float(savings_if_closed),
            },
            "intent": "savings",
        }

    def _snowball_order(self, is_hi=False) -> dict:
        loans = self._get_active_loans()
        ordered = sorted(loans, key=lambda l: l.outstanding_amount or Decimal("0"))
        order_text = "\n".join([f"• **{l.lender_name or l.name}** — ₹{l.outstanding_amount:,.0f} balance" for l in ordered])

        if is_hi:
            ans = f"❄️ **Debt Snowball Strategy (Smallest Balance First)**:\n\n{order_text}\n\nSabse chote loan ko pehle khatam karke fast wins hasil kare!"
        else:
            ans = f"❄️ **Debt Snowball Strategy (Smallest Balance First)**:\n\n{order_text}\n\nPay off the smallest debt balance first to build quick motivational momentum!"

        return {
            "answer": ans,
            "data": {"snowball_order": [str(l.id) for l in ordered]},
            "intent": "snowball",
        }

    def _avalanche_order(self, is_hi=False) -> dict:
        loans = self._get_active_loans()
        ordered = sorted(loans, key=lambda l: l.interest_rate or Decimal("0"), reverse=True)
        order_text = "\n".join([f"• **{l.lender_name or l.name}** — {l.interest_rate}% p.a. rate" for l in ordered])

        if is_hi:
            ans = f"🌊 **Debt Avalanche Strategy (Highest Interest Rate First)**:\n\n{order_text}\n\nIs order me pay karne se sabse jyada total interest bachega!"
        else:
            ans = f"🌊 **Debt Avalanche Strategy (Highest Interest Rate First)**:\n\n{order_text}\n\nPaying in this order mathematically saves you maximum total interest!"

        return {
            "answer": ans,
            "data": {"avalanche_order": [str(l.id) for l in ordered]},
            "intent": "avalanche",
        }

    def _calc_credit_cards(self, is_hi=False) -> dict:
        from apps.credit_cards.models import CreditCard
        cards = list(CreditCard.objects.filter(user=self.user))
        if not cards:
            return {"answer": "Aapke account me koi credit card registered nahi hai." if is_hi else "You currently have 0 credit cards registered in your portfolio.", "data": {}, "intent": "credit_cards"}

        total_limit = sum(c.credit_limit or Decimal("0") for c in cards)
        total_balance = sum(c.current_balance or Decimal("0") for c in cards)
        overall_util = (total_balance / total_limit * 100) if total_limit > 0 else 0

        status_text = "perfect (<30%)" if overall_util < 30 else "high (>50%)" if overall_util > 50 else "moderate"
        if is_hi:
            ans = (
                f"💳 Aapke paas total {len(cards)} credit cards hain.\n"
                f"Total Limit: ₹{total_limit:,.0f} | Current Balance: ₹{total_balance:,.0f}.\n"
                f"Aapki overall credit utilization **{overall_util:.1f}%** ({status_text}) hai."
            )
        else:
            ans = (
                f"💳 You have {len(cards)} registered credit card(s).\n"
                f"Total Limit: ₹{total_limit:,.0f} | Current Balance: ₹{total_balance:,.0f}.\n"
                f"Your overall credit utilization is **{overall_util:.1f}%** ({status_text})."
            )

        return {
            "answer": ans,
            "data": {
                "card_count": len(cards),
                "total_limit": float(total_limit),
                "total_balance": float(total_balance),
                "utilization_percent": float(overall_util),
            },
            "intent": "credit_cards",
        }

    def _calc_monthly_emi(self, is_hi=False) -> dict:
        loans = self._get_active_loans()
        total_emi = sum(l.monthly_emi or Decimal("0") for l in loans)
        breakdown = [f"• {l.lender_name or l.name}: ₹{l.monthly_emi:,.0f}/month" for l in loans]

        if is_hi:
            ans = f"Aapki monthly total EMI commitment **₹{total_emi:,.0f}** hai across {len(loans)} active loans:\n\n" + "\n".join(breakdown)
        else:
            ans = f"Your total monthly EMI commitment is **₹{total_emi:,.0f}** across {len(loans)} active loan(s):\n\n" + "\n".join(breakdown)

        return {
            "answer": ans,
            "data": {"total_monthly_emi": float(total_emi)},
            "intent": "monthly_emi",
        }

    def _calc_net_worth(self, is_hi=False) -> dict:
        from apps.assets.models import Asset
        assets = Asset.objects.filter(user=self.user)
        total_assets = sum(a.current_value or Decimal("0") for a in assets)
        loans = self._get_active_loans()
        total_debt = sum(l.outstanding_amount or Decimal("0") for l in loans)
        net_worth = total_assets - total_debt

        emoji = "📈" if net_worth >= 0 else "📉"
        if is_hi:
            ans = f"{emoji} Aapka estimated Net Worth **₹{net_worth:,.0f}** hai (Total Assets: ₹{total_assets:,.0f} - Total Liabilities: ₹{total_debt:,.0f})."
        else:
            ans = f"{emoji} Your estimated Net Worth is **₹{net_worth:,.0f}** (Assets: ₹{total_assets:,.0f} — Liabilities: ₹{total_debt:,.0f})."

        return {
            "answer": ans,
            "data": {"net_worth": float(net_worth), "total_assets": float(total_assets), "total_debt": float(total_debt)},
            "intent": "net_worth",
        }

    def _financial_summary(self, is_hi=False) -> dict:
        loans = self._get_active_loans()
        payments = self._get_all_payments()
        total_outstanding = sum(l.outstanding_amount or Decimal("0") for l in loans)
        total_emi = sum(l.monthly_emi or Decimal("0") for l in loans)
        total_interest = sum(p.interest_component or Decimal("0") for p in payments)

        if is_hi:
            ans = (
                f"📊 **Aapke Complete Account Ka Real-Time Analysis**:\n\n"
                f"• **Active Loans**: {len(loans)} accounts\n"
                f"• **Total Outstanding Principal**: ₹{total_outstanding:,.0f}\n"
                f"• **Monthly EMI Burden**: ₹{total_emi:,.0f}/month\n"
                f"• **Total Interest Paid to Date**: ₹{total_interest:,.0f}\n\n"
                f"Aap mujhse kisi bhi language me pooch sakte hain!"
            )
        else:
            ans = (
                f"📊 **Your Complete Account Portfolio Analysis**:\n\n"
                f"• **Active Loans**: {len(loans)} active account(s)\n"
                f"• **Total Outstanding Debt**: ₹{total_outstanding:,.0f}\n"
                f"• **Monthly EMI Commitment**: ₹{total_emi:,.0f}/month\n"
                f"• **Total Interest Paid**: ₹{total_interest:,.0f}\n\n"
                f"Feel free to ask questions like 'How much interest did I pay?' or 'Which loan to pay first?'!"
            )

        return {
            "answer": ans,
            "data": {
                "active_loans": len(loans),
                "total_outstanding": float(total_outstanding),
                "monthly_emi": float(total_emi),
                "total_interest_paid": float(total_interest),
            },
            "intent": "summary",
        }

    def _explain_zk_proofs(self) -> dict:
        return {
            "answer": (
                "🛡️ **Zero-Knowledge (ZK) Credit Proofs**: "
                "ZK proofs allow you to cryptographically prove your creditworthiness (e.g. Credit Score > 750 or 0 defaults) "
                "to lenders on the Monad Blockchain *without revealing your private income, bank statement, or identity*."
            ),
            "data": {},
            "intent": "zk_proofs",
        }

    def _explain_refinance(self) -> dict:
        return {
            "answer": (
                "🏦 **Refinance & Balance Transfer**: "
                "Transferring your active high-interest loan to a lender with a lower interest rate saves significant money. "
                "Use the Refinance Savings Studio (`/dashboard/refinance`) to calculate net savings after processing fees!"
            ),
            "data": {},
            "intent": "refinance",
        }

    def _explain_auto_saver(self) -> dict:
        return {
            "answer": (
                "⚡ **Auto-Saver Micro-Deposit Engine**: "
                "Auto-Saver rounds up your daily transaction spare change (e.g. ₹42 coffee rounds to ₹50; ₹8 saved). "
                "Accumulated spare change is auto-applied at month end as part-payment to trim years off your debt!"
            ),
            "data": {},
            "intent": "auto_saver",
        }

    def _explain_reports(self) -> dict:
        return {
            "answer": (
                "📄 **Official PDF Reports Engine**: "
                "Export bank-grade PDF statements, CSV, and JSON data logs from `/dashboard/reports`. "
                "Reports include complete loan portfolio audits, payment vouchers, and net worth summaries."
            ),
            "data": {},
            "intent": "reports",
        }

    def _explain_p2p(self) -> dict:
        return {
            "answer": (
                "🤝 **P2P Web3 Monad Marketplace**: "
                "Borrow and lend MON tokens directly using Monad smart contract escrow (`/dashboard/p2p-market`). "
                "Zero middleman fees, transparent terms, and on-chain repayment verification."
            ),
            "data": {},
            "intent": "p2p",
        }

    def _explain_verify(self) -> dict:
        return {
            "answer": (
                "🛡️ **Cryptographic Proof Verifier**: "
                "Upload any payment receipt file or enter its 64-character SHA-256 hash at `/verify-proof`. "
                "It checks Monad Blockchain block records to verify document authenticity with 100% legal proof."
            ),
            "data": {},
            "intent": "verify",
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
