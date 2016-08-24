using System;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver.GeoJsonObjectModel;

namespace una_CIS_ng.Models
{
  [BsonIgnoreExtraElements]
  public class Penalty
  {
    public ObjectId id { get; set; }

    public string type { get; set; }

    public DateTime submissionTime { get; set; }

    public DateTime? deprecationTime { get; set; }

    /// <summary>
    /// Infrastructure State - For a Penalty this should always be 'Infringing'
    /// </summary>
    public string infState { get; set; }

    public string infLoc { get; set; }

    public string infDisc { get; set; }

    public string infType { get; set; }

    /// <summary>
    /// Permit State - For a Penalty this should always be 'None'
    /// </summary>
    public string permState { get; set; }

    public double[] distances { get; set; }

    public double totalDistance { get; set; }

    public GeoJsonFeatureCollection<GeoJson2DGeographicCoordinates> locations { get; set; }

    //public LonLat[][] locationRoutes { get; set; }

    public string[][] locationDescriptions { get; set; }

    public Party[] parties { get; set; }

    //[BsonElement("permit")]
    //public BsonDocument Permi { get; set; }
  }
}
