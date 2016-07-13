using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver.GeoJsonObjectModel;

namespace una_CIS_ng.Models
{
  [BsonIgnoreExtraElements]
  public class Permit
  {
    public ObjectId id { get; set; }

    public string type { get; set; }

    public bool isSpecialZone { get; set; }

    public string consType { get; set; }

    public double[] distances { get; set; }

    public double totalDistance { get; set; }

    public GeoJsonFeatureCollection<GeoJson2DGeographicCoordinates> locations { get; set; }

    public string[][] locationDescriptions { get; set; }

    public Party[] parties { get; set; }

    //[BsonElement("permit")]
    //public BsonDocument Permi { get; set; }
  }
}
