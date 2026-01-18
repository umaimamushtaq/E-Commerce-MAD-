using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ProductManagementAPI.Models;
using System.Text;


var builder = WebApplication.CreateBuilder(args);


//to get rid of cycle
builder.Services.AddControllers()
    .AddNewtonsoftJson(options =>
    {
        // Configure the serializer to ignore reference loops
        options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
    });



// Add services to the container.
builder.Services.AddControllers();

//DBContext and Connection string
builder.Services.AddDbContext<MyDBContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));



// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


//To run on react native
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowExpo",
        policy =>
        {
            policy.AllowAnyOrigin() // In production, replace with your specific URL
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

//jwt
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidIssuer = builder.Configuration["JwtConfig:Issuer"],
        ValidAudience = builder.Configuration["JwtConfig:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JwtConfig:Key"]!)),
        ValidateIssuer=true,
        ValidateAudience=true,
        ValidateLifetime=true,
        ValidateIssuerSigningKey=true

    };
});
builder.Services.AddAuthorization();



var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// **Enable static files from wwwroot**
app.UseStaticFiles(); //for image

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();


//for react native
app.UseCors("AllowExpo");


app.MapControllers();

app.Run();
