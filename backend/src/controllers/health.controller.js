export function healthController(_req, res) {
  res.status(200).json({
    success: true,
    data: {
      service: "surplus-api",
      status: "healthy",
      timestamp: new Date().toISOString()
    }
  });
}
