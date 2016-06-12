using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace una_CIS_ng.Models.ManageViewModels
{
  public class ConfigureTwoFactorViewModel
  {
    public string SelectedProvider { get; set; }

    public ICollection<SelectListItem> Providers { get; set; }
  }
}
