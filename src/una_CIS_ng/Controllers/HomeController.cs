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
      ViewData["AppCodes"] = _appCodes;

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

      return View();
    }

    public IActionResult Map()
    {
      ViewData["Map:GoogleAPIKey"] = _appCodes.GoogleApiKey;
      ViewData["Message"] = "Infrastructure Map";

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
  }
}
