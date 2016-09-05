using System;
using System.Net;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using SendGrid;
using SendGrid.Helpers.Mail;
using una_CIS_ng.Models;

namespace una_CIS_ng.Services
{
  // This class is used by the application to send Email and SMS
  // when you turn on two-factor authentication in ASP.NET Identity.
  // For more details see this link http://go.microsoft.com/fwlink/?LinkID=532713
  public class AuthMessageSender : IEmailSender, ISmsSender
  {
    private readonly AppCodes _appCodes;

    public AuthMessageSender(IOptions<AppCodes> optionsAccessor)
    {
      _appCodes = optionsAccessor.Value;
    }

    public Task SendEmailAsync(string email, string subject, string message)
    {
      // Plug in your email service here to send an email.
      var apiKey = _appCodes.SendGridApiKey;
      dynamic sg = new SendGridAPIClient(apiKey);

      var from = new Email("do_not_reply@cis.ng", "CIS-Do Not Reply");
      var to = new Email("lee@md8n.com", "Lee Humphries");
      //var to = new Email("obikenz@hotmail.com", "Obike NZ");
      //Email[] cc = { to, new Email("lee@md8n.com"), new Email("meteorist@live.com"), new Email("info@cis.ng"), new Email("chukwudi.okpara@cis.ng") };

      var content = new Content("text/plain", message);
      var mail = new Mail(from, subject, to, content);
      dynamic response = sg.client.mail.send.post(requestBody: mail.Get());
      var respCode = response.StatusCode as HttpStatusCode?;
      if (!respCode.HasValue)
      {
        return Task.FromException(new Exception("Attempted to send message, but no response was returned."));
      }
      switch (respCode.Value)
      {
        case HttpStatusCode.Accepted:
          break;
        default:
          return Task.FromException(new Exception(
            $"Attempted to send message, the HTTP response ({respCode.Value}) was returned."));
      }

      return Task.FromResult(0);
    }

    public Task SendSmsAsync(string number, string message)
    {
      // Plug in your SMS service here to send a text message.
      return Task.FromResult(0);
    }
  }
}
