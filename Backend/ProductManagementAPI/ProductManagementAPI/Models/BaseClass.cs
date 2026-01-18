namespace ProductManagementAPI.Models
{
    public class BaseClass
    {
        public int Id { get; set; }
        public DateTime CreatedAt { get; set; }=DateTime.Now;
        public DateTime? UpdatedAt {  get; set; }
        public bool IsDeleted { get; set; } = false;

        public virtual void UpdateTimestamp()
        {
            UpdatedAt=DateTime.Now;
        }

        public void SoftDelete()
        {
            IsDeleted = true;
            UpdateTimestamp();
        }


    }
}
