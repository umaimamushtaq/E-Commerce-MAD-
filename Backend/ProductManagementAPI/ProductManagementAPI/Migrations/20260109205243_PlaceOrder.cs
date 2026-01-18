using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProductManagementAPI.Migrations
{
    /// <inheritdoc />
    public partial class PlaceOrder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DeliveryFee",
                table: "UserOrders",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "PhoneNumber",
                table: "UserOrders",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ShippingAddress",
                table: "UserOrders",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DeliveryFee",
                table: "UserOrders");

            migrationBuilder.DropColumn(
                name: "PhoneNumber",
                table: "UserOrders");

            migrationBuilder.DropColumn(
                name: "ShippingAddress",
                table: "UserOrders");
        }
    }
}
