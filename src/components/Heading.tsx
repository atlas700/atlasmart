export default function Heading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2
        className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight"
        aria-label={title}
      >
        {title}
      </h2>

      <p className="text-sm text-black font-light">{description}</p>
    </div>
  );
}
