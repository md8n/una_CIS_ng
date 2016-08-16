using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace una_CIS_ng.Models
{
  [BsonIgnoreExtraElements]
  public class FeeDefinition
  {
    public ObjectId _id { get; set; }

    public string feeType { get; set; }

    public string condition { get; set; }

    public string name { get; set; }

    public double unit { get; set; }

    public double divider { get; set; }

    public string measure { get; set; }

    /// <summary>
    /// The rate in Naira for this infrastructure
    /// </summary>
    /// <remarks>If null then rateDesc must be provided</remarks>
    public double? rate { get; set; }

    /// <summary>
    /// The description of the rate when it cannot be used as part of a formula
    /// </summary>
    /// <remarks>If null or empty then rate must be provided</remarks>
    public string rateDesc { get; set; }
  }
}
