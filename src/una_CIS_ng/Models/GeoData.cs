using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver.GeoJsonObjectModel;

namespace una_CIS_ng.Models
{
  public class GeoData
  {
    public ObjectId Id { get; set; }
    
    [BsonElement("geoData")]
    public GeoJsonFeature<GeoJson2DGeographicCoordinates> Feature { get; set; }
  }
}
