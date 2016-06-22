using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Internal;

namespace una_CIS_ng.Core
{
  public class JsonStringResult : ContentResult
  {
    /// <summary>
    /// Return a string that has already been pre-formatted as json as a json response
    /// </summary>
    /// <param name="json"></param>
    public JsonStringResult(string json)
    {
      Content = json;
      ContentType = "application/json";
    }

    public JsonStringResult(Dictionary<string, string> json)
    {
      Content = JsonBody(json);
      ContentType = "application/json";
    }

    public JsonStringResult(IEnumerable<Dictionary<string, string>> json)
    {
      Content = JsonBody(json);
      ContentType = "application/json";
    }

    private string JsonBody(Dictionary<string, string> json)
    {
      return "{" + json.Select(jsKvp => $"\"{jsKvp.Key}\": {jsKvp.Value}").ToList().Join(",\r\n") + "}";
    }

    private string JsonBody(IEnumerable<Dictionary<string, string>> json)
    {
      return "[" + json.Select(JsonBody).ToList().Join(",\r\n") + "]";
    }
  }
}
