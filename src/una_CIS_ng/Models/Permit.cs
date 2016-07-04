using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace una_CIS_ng.Models
{
  public class Permit
  {
    public ObjectId Id { get; set; }
    
    [BsonElement("permit")]
    public BsonDocument Permi { get; set; }
  }
}
