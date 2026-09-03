# MarMic Releases

Official MarMic website: [https://mic.marhub.ru/](https://mic.marhub.ru/)

Stable Desktop artifacts are published as versioned releases.

The fixed `desktop-recovery-v1` prerelease contains only a short-lived,
Ed25519-signed emergency compatibility manifest. It does not change the
stable/latest application release. The signing private key exists only as a
GitHub Actions secret; Desktop packages receive only its public key.

Public Windows update artifacts for MarMic Desktop. Source code is maintained separately.

## Windows 0.18.0 — Русский

Установщик распространяется без коммерческой Authenticode-подписи:
**NOT SIGNED — INTENTIONAL**. Windows может показать предупреждение
SmartScreen/неизвестного издателя; Smart App Control или политика организации
могут запретить запуск. Скачивайте только с официальной страницы или этого
GitHub Release и сверяйте SHA-256 из `SHA256SUMS.txt` и release notes.

Ed25519-подпись MarMic защищает обновления и проверяется клиентом 0.18.0 и новее.
Она не заменяет Authenticode и не делает первую ручную установку доверенной
для Windows. Рядом с installer публикуется подписанный update companion.

## Windows 0.18.0 — English

The installer is distributed without a commercial Authenticode signature:
**NOT SIGNED — INTENTIONAL**. Windows may display a SmartScreen/unknown-publisher
warning; Smart App Control or an organization policy may block execution.
Download only from the official website or this GitHub Release and compare the
SHA-256 published in `SHA256SUMS.txt` and the release notes.

MarMic's Ed25519 signature protects updates and is verified by clients 0.18.0
and later. It does not replace Authenticode or make the first manual installation
trusted by Windows. A signed update companion is published beside the installer.
