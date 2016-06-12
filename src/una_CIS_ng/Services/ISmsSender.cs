using System.Threading.Tasks;

namespace una_CIS_ng.Services
{
  public interface ISmsSender
  {
    Task SendSmsAsync(string number, string message);
  }
}
