using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace una_CIS_ng.Models
{
  public class GeoData
  {
    public ObjectId Id { get; set; }

    [BsonElement("DummyStuff")]
    public string DummyStuff { get; set; }
  }
}
