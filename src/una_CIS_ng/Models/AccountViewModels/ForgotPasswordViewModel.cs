using System.ComponentModel.DataAnnotations;

namespace una_CIS_ng.Models.AccountViewModels
{
    public class ForgotPasswordViewModel
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }
    }
}
