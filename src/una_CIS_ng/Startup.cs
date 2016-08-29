using System.Linq;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Formatters;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Net.Http.Headers;
using una_CIS_ng.Data;
using una_CIS_ng.Models;
using una_CIS_ng.Repository;
using una_CIS_ng.Services;

namespace una_CIS_ng
{
  public class Startup
  {
    public Startup(IHostingEnvironment env)
    {
      var builder = new ConfigurationBuilder()
          .SetBasePath(env.ContentRootPath)
          .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
          .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true);

      if (env.IsDevelopment())
      {
        // For more details on using the user secret store see http://go.microsoft.com/fwlink/?LinkID=532709
        builder.AddUserSecrets();

        // This will push telemetry data through Application Insights pipeline faster, allowing you to view results immediately.
        builder.AddApplicationInsightsSettings(developerMode: true);
      }

      builder.AddEnvironmentVariables();
      Configuration = builder.Build();
    }

    public IConfigurationRoot Configuration { get; }

    // This method gets called by the runtime. Use this method to add services to the container.
    public void ConfigureServices(IServiceCollection services)
    {
      // Add framework services.
      services.AddApplicationInsightsTelemetry(Configuration);

      services.AddDbContext<ApplicationDbContext>(options =>
          options.UseSqlServer(Configuration.GetConnectionString("DefaultConnection")));

      services.AddIdentity<ApplicationUser, IdentityRole>()
          .AddEntityFrameworkStores<ApplicationDbContext>()
          .AddDefaultTokenProviders();

      services.AddOptions();
      services.Configure<AppCodes>(ac =>
      {
        ac.GoogleApiKey = Configuration["GoogleMapApiKey"];
        ac.GoogleApiBrowserKey = Configuration["GoogleMapReverseGeocodeBrowserKey"];
        ac.MongoConnection = Configuration.GetConnectionString("MongoConnection");
        ac.MongoDbName = Configuration["MongoDbName"];
        ac.SendGridApiKey = Configuration["SendGridApiKey"];
      });

      services.AddMvc();
      services.Configure<MvcOptions>(options =>
      {
        options.InputFormatters
          .OfType<JsonInputFormatter>()
          .First()
          .SupportedMediaTypes
          .Add(MediaTypeHeaderValue.Parse("application/csp-report"));
      });
      services.AddMvcCore();

      // Add application services.
      services.AddTransient<IEmailSender, AuthMessageSender>();
      services.AddTransient<ISmsSender, AuthMessageSender>();

      // Add repository services.
      services.AddSingleton<IGeoDataRepository, GeoDataRepository>();
      services.AddSingleton<IFeeDefinitionRepository, FeeDefinitionRepository>();
      services.AddSingleton<IPermitRepository, PermitRepository>();
      services.AddSingleton<IPenaltyRepository, PenaltyRepository>();

    }

    // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
    public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
    {
      loggerFactory.AddConsole(Configuration.GetSection("Logging"));
      loggerFactory.AddDebug();

      app.UseApplicationInsightsRequestTelemetry();


      string defCsp;
      if (env.IsDevelopment())
      {
        defCsp = "'self' http://una.cis.ng/ http://localhost:5000/";

        app.UseDeveloperExceptionPage();
        app.UseDatabaseErrorPage();
        app.UseBrowserLink();
      }
      else
      {
        defCsp = "'self' http://una.cis.ng/ http://unacisng.azurewebsites.net/";

        app.UseExceptionHandler("/Home/Error");
      }

      var cspPolicy = "default-src 'none'; ";
      cspPolicy += "form-action " + defCsp + "; ";
      cspPolicy += "connect-src " + defCsp + "; ";
      // TODO: Figure out what needs unsafe inline and unsafe eval (fee directives does need eval)
      cspPolicy += "script-src 'unsafe-inline' 'unsafe-eval' " + defCsp + " https://maps.googleapis.com https://ajax.googleapis.com dc.services.visualstudio.com; ";
      cspPolicy += "style-src 'unsafe-inline' " + defCsp + " https://fonts.googleapis.com; ";
      cspPolicy += "font-src " + defCsp + " https://fonts.gstatic.com; ";
      cspPolicy += "img-src " + defCsp + " https://maps.googleapis.com https://maps.gstatic.com https://csi.gstatic.com; ";
      cspPolicy += "object-src " + defCsp + "; ";
      cspPolicy += "report-uri /cspreport; ";

      app.UseApplicationInsightsExceptionTelemetry();
      app.UseStaticFiles();
      app.UseIdentity();

      // Add external authentication middleware below. To configure them please see http://go.microsoft.com/fwlink/?LinkID=532715
      app.Use(async (ctx, next) =>
      {
        ctx.Response.Headers.Add("Content-Security-Policy", cspPolicy);
        await next();
      });

      app.UseMvc(routes =>
      {
        routes.MapRoute(
                  name: "default",
                  template: "{controller=Home}/{action=Index}/{id?}");
        routes.MapRoute("ApiRoute", "{controller}/{id?}");
      });
    }
  }
}
