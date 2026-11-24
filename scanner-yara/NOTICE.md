# Third-party notices

## Neo23x0/signature-base

The scanner image includes selected YARA rules from [Neo23x0/signature-base](https://github.com/Neo23x0/signature-base), pinned to commit `fffcaa4d3931d791a2553f01457966144418a316`.

The repository default licence is Detection Rule License (DRL) 1.1. Rules declaring an explicit different licence are excluded from the compiled bundle. The full upstream `LICENSE` file is copied into the runtime image as `/app/SIGNATURE-BASE-LICENSE`. Rule metadata is retained, and every match response includes the author when supplied, a stable source URL, the license identifier and (for upstream rules) the license file URL. The Vercel API preserves these attributions in its audit record and displays them to the user when a rule matches.

DRL 1.1 requires attribution when sharing rules and when sharing messages based on rule matches. Do not strip author/source metadata from the scanner's response or audit record.

## YARA

The scanner uses `yara-python==4.5.4`. See the [YARA project](https://github.com/VirusTotal/yara) and [Python binding documentation](https://yara.readthedocs.io/en/stable/yarapython.html).

## DSAI EICAR test rule

`scanner-yara/rules/eicar_test.yar` is an original DSAI integration-test rule that matches the harmless EICAR test string. It is not a malware sample.
