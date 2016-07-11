using System;
using System.IO;
using iTextSharp.text;
using iTextSharp.text.pdf;

namespace una_CIS_ng.Services
{
  public class PDFPageEvent : IPdfPageEvent
  {
    private string _machineInfo;
    private string _shiftInfo;

    private BaseFont _bf;
    private PdfContentByte _cb;
    private PdfTemplate _tm;

    public PDFPageEvent(string machineInfo, string shiftInfo)
    {
      _machineInfo = machineInfo;
      _shiftInfo = shiftInfo;
    }

    public void OnOpenDocument(PdfWriter writer, Document document)
    {
      try
      {
        _bf = BaseFont.CreateFont(BaseFont.HELVETICA, BaseFont.CP1252, BaseFont.NOT_EMBEDDED);
        _cb = writer.DirectContent;
        _tm = _cb.CreateTemplate(50, 50);
      }
      catch (DocumentException dEx)
      {

      }
      catch (IOException ioEx)
      {
        
      }
    }

    public void OnStartPage(PdfWriter writer, Document document)
    {
      SetHeader(writer, document);
    }

    public void OnEndPage(PdfWriter writer, Document document)
    {
      SetFooter(writer, document);
    }

    public void OnCloseDocument(PdfWriter writer, Document document)
    {
      _tm.BeginText();
      _tm.SetFontAndSize(_bf, 10.5f);
      _tm.ShowText((writer.PageNumber - 1).ToString());
      _tm.EndText();
    }

    public void OnParagraph(PdfWriter writer, Document document, float paragraphPosition)
    {
      throw new NotImplementedException();
    }

    public void OnParagraphEnd(PdfWriter writer, Document document, float paragraphPosition)
    {
      throw new NotImplementedException();
    }

    public void OnChapter(PdfWriter writer, Document document, float paragraphPosition, Paragraph title)
    {
      throw new NotImplementedException();
    }

    public void OnChapterEnd(PdfWriter writer, Document document, float paragraphPosition)
    {
      throw new NotImplementedException();
    }

    public void OnSection(PdfWriter writer, Document document, float paragraphPosition, int depth, Paragraph title)
    {
      throw new NotImplementedException();
    }

    public void OnSectionEnd(PdfWriter writer, Document document, float paragraphPosition)
    {
      throw new NotImplementedException();
    }

    public void OnGenericTag(PdfWriter writer, Document document, Rectangle rect, string text)
    {
      throw new NotImplementedException();
    }

    private void SetHeader(PdfWriter writer, Document document)
    {
      var defFont = FontFactory.GetFont(BaseFont.HELVETICA, 9, Font.NORMAL);

      var titleCell = BuildCell("Permit Application", defFont);
      var mInfoCell = BuildCell(_machineInfo, defFont);
      var sInfoCell = BuildCell(_shiftInfo, defFont);

      // Get page size info
      var pWidth = document.PageSize.Width;
      var pHeight = document.PageSize.Height;

      // Build the header table
      var oTable = new PdfPTable(3);
      oTable.AddCell(titleCell);
      oTable.AddCell(mInfoCell);
      oTable.AddCell(sInfoCell);
      oTable.TotalWidth = pWidth - 20;

      // Write the header
      oTable.WriteSelectedRows(0, -1, 10, pHeight - 15, writer.DirectContent);

      // Draw a line below the header
      _cb.MoveTo(30, pHeight - 35);
      _cb.LineTo(pWidth - 40, pHeight - 35);
      _cb.Stroke();
    }

    private void SetFooter(PdfWriter writer, Document document)
    {
      // Get page size info
      var pWidth = document.PageSize.Width;

      const float fTextSize = 8;

      // Draw a line above the footer
      _cb.MoveTo(30, 40);
      _cb.LineTo(pWidth - 40, 40);
      _cb.Stroke();

      // Disclaimer
      EmitCell("Confidential", fTextSize, 30, 30);

      // Date / Time
      var dtText = DateTime.Now.ToString("yyyy-MMM-dd HH:mm");
      var dtLen = _bf.GetWidthPoint(dtText, fTextSize);
      EmitCell(dtText, fTextSize, (pWidth - dtLen) / 2, 30);

      // Page Number
      var pNum = writer.PageNumber;
      var pnText = $"Page {pNum}";
      var pnLen = _bf.GetWidthPoint(pnText, fTextSize);
      EmitCell(pnText, fTextSize, pWidth - 90, 30);

      // Total Pages Template
      _cb.AddTemplate(_tm, pWidth - 90 + pnLen, 30);
    }

    private void EmitCell(string text, float textSize, float x, float y)
    {
      _cb.BeginText();
      _cb.SetFontAndSize(_bf, textSize);
      _cb.SetTextMatrix(x, y);
      _cb.ShowText(text);
      _cb.EndText();
    }

    private static PdfPCell BuildCell(string phraseBody, Font font, int horizontalAlignment = Element.ALIGN_CENTER, int border = 0)
    {
      return new PdfPCell(new Phrase(phraseBody, font))
      {
        Border = border,
        HorizontalAlignment = horizontalAlignment
      };
    }
  }
}
