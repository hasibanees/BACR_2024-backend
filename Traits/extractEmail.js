import xlsx from 'xlsx';

const extractEmailsFromExcel = (fileBuffer) => {
  try {
    // Read the Excel file from buffer
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    
    // Check if the workbook has sheets
    if (!workbook.SheetNames.length) {
      throw new Error("Excel file contains no sheets.");
    }

    // Get the first sheet
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    // Convert the worksheet data to JSON
    const emailData = xlsx.utils.sheet_to_json(worksheet, { header: 1 }).flat();
    console.log("Extracted data:", emailData);

    // Validate email addresses
    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    
    const validEmails = emailData.filter(isValidEmail);
    const invalidEmails = emailData.filter((email) => !isValidEmail(email));

    console.log("Valid emails:", validEmails);
    console.log("Invalid emails:", invalidEmails);

    return {
      validEmails,
      invalidEmails,
    };
  } catch (error) {
    console.error("Error reading Excel file:", error);
    throw new Error(`Failed to process the Excel file: ${error.message}`);
  }
};

export default extractEmailsFromExcel;
