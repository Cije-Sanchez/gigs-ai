export function Error({ error }: { error: string }) {
  return (
    <div className="min-h-24 h-full w-full flex flex-row items-center justify-center text-destructive">
      {error}
    </div>
  );
}
