using System.ComponentModel.DataAnnotations;

namespace una_CIS_ng.ViewModels.Manage
{
  public class AddPhoneNumberViewModel
  {
    [Required]
    [Phone]
    [Display(Name = "Phone number")]
    public string PhoneNumber { get; set; }
  }
}
