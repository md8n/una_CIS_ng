using System.ComponentModel.DataAnnotations;

namespace una_CIS_ng.Models.ManageViewModels
{
  public class AddPhoneNumberViewModel
  {
    [Required]
    [Phone]
    [Display(Name = "Phone number")]
    public string PhoneNumber { get; set; }
  }
}
