using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MongoDB.Bson;

namespace una_CIS_ng.Models
{
  public class BaseParty
  {
    public ObjectId id { get; set; }

    public string type { get; set; }

    public object addresses { get; set; }

  }
}
