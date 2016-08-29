using System;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using una_CIS_ng.Core;
using una_CIS_ng.Models;

namespace una_CIS_ng.Controllers
{
  public class HomeController : Controller
  {
    private readonly AppCodes _appCodes;

    public HomeController(IOptions<AppCodes> optionsAccessor)
    {
      _appCodes = optionsAccessor.Value;
    }

    public IActionResult Index()
    {
      return View();
    }

    public IActionResult About()
    {
      ViewData["Message"] = Constants.LasimraAbbr + ", " + Constants.UnaAbbr + ", " + Constants.CisAbbr;

      return View();
    }

    public IActionResult Permit()
    {
      ViewData["Message"] = "Right-of-Way / Construction";
      ViewData["GoogleAPIKey"] = _appCodes.GoogleApiKey;
      ViewData["GoogleAPIBrowserKey"] = _appCodes.GoogleApiBrowserKey;

      return View();
    }

    public IActionResult Penalty()
    {
      ViewData["Message"] = "Penalty";
      ViewData["GoogleAPIKey"] = _appCodes.GoogleApiKey;
      ViewData["GoogleAPIBrowserKey"] = _appCodes.GoogleApiBrowserKey;

      return View();
    }

    public IActionResult PermitInfo()
    {
      ViewData["Message"] = "General Permit Information";

      return View();
    }

    public IActionResult PermitFee()
    {
      ViewData["Message"] = "Permit Fee Estimator";

      return View();
    }

    public IActionResult Map()
    {
      ViewData["Message"] = "Infrastructure Map";
      ViewData["GoogleAPIKey"] = _appCodes.GoogleApiKey;
      ViewData["GoogleAPIBrowserKey"] = _appCodes.GoogleApiBrowserKey;

      return View();
    }

    public IActionResult Contact()
    {
      ViewData["Message"] = "Contacts for the " + Constants.UnaFullTitle;

      return View();
    }

    public IActionResult Error()
    {
      return View();
    }

    [HttpPost("~/cspreport")]
    public IActionResult CspReport([FromBody] CspReportRequest request)
    {
      var reqCspRep = request.CspReport;
      // TODO: log request to a datastore somewhere
      var cspViolation = new StringBuilder("CSP Violation:");
      cspViolation.AppendFormat("  URIs- Document:{0}, Blocked:{1}", reqCspRep.DocumentUri, reqCspRep.BlockedUri);
      cspViolation.AppendLine();
      //if (!string.IsNullOrWhiteSpace(reqCspRep.OriginalPolicy))
      //{
      //  cspViolation.AppendFormat("  Original Policy:{0}", reqCspRep.OriginalPolicy);
      //  cspViolation.AppendLine();
      //}
      cspViolation.AppendFormat("  Directives- Violated:{0}, Effective:{1} ", reqCspRep.ViolatedDirective, reqCspRep.EffectiveDirective);
      cspViolation.AppendLine();
      if (!string.IsNullOrWhiteSpace(reqCspRep.Referrer))
      {
        cspViolation.AppendFormat("  Referrer:{0}", reqCspRep.Referrer);
        cspViolation.AppendLine();
      }
      cspViolation.AppendFormat(" Status Code:{0}", reqCspRep.StatusCode);

      Console.WriteLine(cspViolation.ToString());

      return Ok();
    }
  }
}
