interface PlaceholderValues {
  CustomerName: string;
  CompanyName: string;
  InvoiceNumber: string;
  Amount: string;
  DueDate: string;
}

export const messageBuilder = {
  buildMessage(template: string, values: PlaceholderValues): string {
    let result = template;
    result = result.replace(/\{\{CustomerName\}\}/g, values.CustomerName);
    result = result.replace(/\{\{CompanyName\}\}/g, values.CompanyName);
    result = result.replace(/\{\{InvoiceNumber\}\}/g, values.InvoiceNumber);
    result = result.replace(/\{\{Amount\}\}/g, values.Amount);
    result = result.replace(/\{\{DueDate\}\}/g, values.DueDate);
    return result;
  }
};
