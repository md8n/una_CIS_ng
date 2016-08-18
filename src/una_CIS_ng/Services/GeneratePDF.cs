using System.IO;
using iTextSharp.text;
using iTextSharp.text.pdf;
using una_CIS_ng.Core;

namespace una_CIS_ng.Services
{
  public class GeneratePDF
  {
    /// <summary>
    /// Creates a blank A4 PDF document with appropriate metadata
    /// </summary>
    /// <param name="title"></param>
    /// <param name="subject"></param>
    /// <param name="author"></param>
    /// <param name="keywords">A comma separated list of keywords</param>
    /// <returns></returns>
    public static Document CreatePDFDocument(string title, string subject, string author, string keywords)
    {
      var oDoc = new Document(PageSize.A4);

      oDoc.AddTitle(title);
      oDoc.AddSubject(subject);
      oDoc.AddAuthor(author);
      oDoc.AddCreationDate();
      oDoc.AddKeywords(keywords);

      return oDoc;
    }

    /// <summary>
    /// Creates a blank A4 PDF document with appropriate metadata for a Permit Application
    /// </summary>
    /// <param name="permitType">The permit type being applied for</param>
    /// <param name="permitHolderName">The party applying for the Permit.  Assumed to be the Permit Holder.</param>
    /// <returns></returns>
    public static Document CreatePDFPermitApplication(string permitType, string permitHolderName)
    {
      return CreatePDFDocument(
        "Permit Application - " + permitType + " for " + permitHolderName,
        "Permit Application",
        Constants.CisFullTitle, 
        "Permit Application, " + permitType + ", " + permitHolderName + ", " + Constants.LasimraAbbr + ", " + Constants.CisAbbr + ", "+ Constants.LagosAbbr + ", Nigeria");
    }

    public static PdfWriter CreatePdfWriter(Document oDoc, Stream docStream)
    {
      if (docStream == null)
      {
        docStream = new MemoryStream();
      }

      var oWriter = PdfWriter.GetInstance(oDoc, docStream);
      // Added so that if the PDF is embedded in a page it will ask the user if they wish to print (if print is selected)
      //oWriter.AddJavaScript("this.print(false);", false);

      return oWriter;
    }
  }
}
