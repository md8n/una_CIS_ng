using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace una_CIS_ng.Models
{
  [BsonIgnoreExtraElements]
  public class Address
  {
    public ObjectId? id { get; set; }

    public string type { get; set; }

    public bool isMailing { get; set; }

    public string unit { get; set; }
    public string street { get; set; }
    public string suburb { get; set; }
    public string state { get; set; }
    public string postcode { get; set; }
    public string country { get; set; }
  }
}
