// Production deployment source module.
// Required production source file; kept in the deployment commit.
const GOOGLE_ADS_CONVERSION = "AW-314681422/QQ2zCM7U_YUcEM7QhpYB";

export function reportBookYourAppointmentConversion() {
  const gtag = (
    window as Window & {
      gtag?: (
        command: "event",
        eventName: "conversion",
        params: { send_to: string; value: number; currency: string },
      ) => void;
    }
  ).gtag;

  gtag?.("event", "conversion", {
    send_to: GOOGLE_ADS_CONVERSION,
    value: 1.0,
    currency: "USD",
  });
}
