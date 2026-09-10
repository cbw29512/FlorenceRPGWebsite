# Lighthouse performance gate policy

Light Tower keeps a perfect-score Lighthouse category gate for Performance, Accessibility, Best Practices, and SEO.

Performance measurements in a shared CI browser are inherently variable, so a single cold run is not a reliable release decision. The Guild therefore collects three Lighthouse runs per URL and asserts the median category score. The threshold remains 1.0 (100/100).

This changes measurement reliability, not the quality target. A median performance score below 100 still fails the release gate.

Source validation, organizer security validation, production-output validation, and all other release checks remain unchanged.
