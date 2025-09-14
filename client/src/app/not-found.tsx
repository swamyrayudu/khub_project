

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="mb-6 text-gray-500">
        Sorry, the page you are looking for does not exist.
      </p>
      {/* <Button className="bg-green-500 text-white rounded hover:bg-green-700">
        <Link
          href="/"
          className="px-4 py-2 transition-colors font-semibold"
        >
          Go Home
        </Link>
      </Button> */}
    </div>
  );
}
