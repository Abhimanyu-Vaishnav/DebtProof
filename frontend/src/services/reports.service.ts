import apiClient from "./api";

export interface ReportFilterParams {
  start_date?: string;
  end_date?: string;
  loan_id?: string;
  format?: "csv" | "json";
}

export const reportsService = {
  downloadPaymentsReport: async (params?: ReportFilterParams): Promise<void> => {
    const ext = params?.format === "json" ? "json" : "csv";
    const response = await apiClient.get("payments/export/csv/", {
      params,
      responseType: "blob",
    });
    const blob = new Blob([response.data], { type: ext === "json" ? "application/json" : "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `debtproof_payments_history.${ext}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  /**
   * Triggers browser download using the Unified Reports endpoint.
   */
  downloadUnifiedReport: async (reportType: string, format: string): Promise<void> => {
    const token = localStorage.getItem("dp_access_token");
    let baseUrl = apiClient.defaults.baseURL || "";
    if (!baseUrl.startsWith("http")) {
      const hostname = typeof window !== "undefined" ? window.location.hostname : "localhost";
      baseUrl = `http://${hostname}:8000/api/v1`;
    }
    const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

    if (format === "pdf") {
      const exportUrl = `${cleanBaseUrl}/payments/export/unified/?report_type=${reportType}&format=pdf&token=${token}`;
      window.open(exportUrl, "_blank");
      return;
    }

    const response = await apiClient.get("payments/export/unified/", {
      params: { report_type: reportType, format },
      responseType: "blob",
    });
    
    let mimeType = "text/csv";
    if (format === "xls") mimeType = "application/vnd.ms-excel";

    const blob = new Blob([response.data], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `debtproof_${reportType}.${format}`);
    
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  /**
   * Triggers browser download for active/closed loans ledger CSV report.
   */
  downloadLoansCSV: async (): Promise<void> => {
    const response = await apiClient.get("loans/export/csv/", {
      responseType: "blob",
    });
    const blob = new Blob([response.data], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "debtproof_loans_ledger.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  /**
   * Downloads user's latest Net Worth calculations as a JSON file.
   */
  downloadNetWorthJSON: async (): Promise<void> => {
    const { data } = await apiClient.get("assets/net-worth/");
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(data.net_worth_summary, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.setAttribute("download", "debtproof_networth_snapshot.json");
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};
