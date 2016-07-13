using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace una_CIS_ng.Models
{
  [BsonIgnoreExtraElements]
  public class Party
  {
    public ObjectId? id { get; set; }

    public string type { get; set; }

    public string entityType { get; set; }

    public string personalName { get; set; }
    public string surname { get; set; }
    /// <summary>
    /// Organisation Name
    /// </summary>
    public string name { get; set; }

    public string email { get; set; }

    public string mobile { get; set; }

    public string officePhone { get; set; }

    [BsonIgnoreIfNull]
    public Address[] address { get; set; }

    public bool isInfrastructureOwner { get; set; }
  }
}
