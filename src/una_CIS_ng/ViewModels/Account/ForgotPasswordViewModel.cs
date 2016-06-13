using System.ComponentModel.DataAnnotations;

namespace una_CIS_ng.ViewModels.Account
{
    public class ForgotPasswordViewModel
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }
    }
}
