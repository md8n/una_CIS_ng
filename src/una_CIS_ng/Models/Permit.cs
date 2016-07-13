using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace una_CIS_ng.Models
{
  public class Permit
  {
    public ObjectId id { get; set; }

    public string type { get; set; }

    public bool isSpecialZone { get; set; }

    public string consType { get; set; }

    public double[] distances { get; set; }

    public double totalDistance { get; set; }

    public object[] locations { get; set; }

    public string[][] locationDescriptions { get; set; }

    public object parties { get; set; }

    //[BsonElement("permit")]
    //public BsonDocument Permi { get; set; }
  }
}
