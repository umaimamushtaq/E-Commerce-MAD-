using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProductManagementAPI.Migrations
{
    /// <inheritdoc />
    public partial class ProductUpdated : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<float>(
                name: "Rating",
                table: "Products",
                type: "real",
                nullable: false,
                defaultValue: 0f);

            migrationBuilder.AddColumn<int>(
                name: "RatingCount",
                table: "Products",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Rating",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "RatingCount",
                table: "Products");
        }
    }
}
