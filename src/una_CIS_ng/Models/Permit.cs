using System;
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

    /// <summary>
    /// Records when a permit / permit application was first submitted
    /// </summary>
    public DateTime submissionTime { get; set; }

    /// <summary>
    /// Records when a permit was first approved (i.e. transition from permit application to permit)
    /// </summary>
    public DateTime? approvalTime { get; set; }

    /// <summary>
    /// Records when a permit / permit application was deprecated (eqv. to deleted)
    /// </summary>
    public DateTime? deprecationTime { get; set; }

    public string infState { get; set; }

    public string infLoc { get; set; }

    public string infDisc { get; set; }

    public string infType { get; set; }

    public string consType { get; set; }

    public int consPermits { get; set; }

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
