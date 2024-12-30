function Avatar({ url, className }: { url: string; className?: string }) {
  return (
    <img
      loading="lazy"
      className={`h-9 rounded-full cursor-pointer transition transform hover:scale-110 ${className || ""}`}
      src={url}
      alt="profile pic"
    />
  );
}
export default Avatar;
