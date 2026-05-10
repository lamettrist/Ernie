/*
 * ============================================================
 *  Spinning Bagel — ASCII torus renderer in C++
 *  Based on the legendary "donut.c" by Andy Sloane (a1k0n)
 *  https://www.a1k0n.net/2011/07/20/donut-math.html
 *
 *  Compile:  g++ -O2 -o bagel bagel.cpp -lm
 *  Run:      ./bagel
 *  Stop:     Ctrl+C
 * ============================================================
 */

#include <cmath>
#include <cstdio>
#include <cstring>
#include <unistd.h>   // usleep

/* ── Terminal dimensions ───────────────────────────────────── */
static const int   W   = 80;   // columns
static const int   H   = 24;   // rows
static const float PI  = 3.14159265358979f;

/* ── Torus parameters ──────────────────────────────────────── */
// R1 = radius of the tube,  R2 = distance from tube centre to torus centre
static const float R1  = 1.0f;
static const float R2  = 2.0f;
// K1: screen-space scaling,  K2: distance from viewer to torus
static const float K2  = 5.0f;
static const float K1  = W * K2 * 3.0f / (8.0f * (R1 + R2));

/* ── ASCII luminance palette (darkest → brightest) ─────────── */
static const char PALETTE[] = ".,-~:;=!*#$@";
static const int  NSHADES   = (int)(sizeof(PALETTE) - 1);

/* ── Buffers ───────────────────────────────────────────────── */
static char  screen[H][W + 1];   // character framebuffer
static float zbuf  [H][W];       // depth buffer (1/z)

/* ────────────────────────────────────────────────────────────
 *  render_frame
 *  A  = rotation angle around the X-axis
 *  B  = rotation angle around the Z-axis
 * ──────────────────────────────────────────────────────────── */
static void render_frame(float A, float B)
{
    /* Pre-compute sines / cosines for A and B */
    float sinA = sinf(A), cosA = cosf(A);
    float sinB = sinf(B), cosB = cosf(B);

    /* Clear buffers */
    for (int y = 0; y < H; ++y) {
        memset(screen[y], ' ', W);
        screen[y][W] = '\0';
        for (int x = 0; x < W; ++x) zbuf[y][x] = 0.0f;
    }

    /* Iterate over θ (tube angle) and φ (revolution angle) */
    for (float theta = 0; theta < 2 * PI; theta += 0.07f) {
        float sinT = sinf(theta), cosT = cosf(theta);

        for (float phi = 0; phi < 2 * PI; phi += 0.02f) {
            float sinP = sinf(phi), cosP = cosf(phi);

            /* ── 3-D torus point ──────────────────────────── */
            // Circle in the XZ plane, then revolve around Y
            float cx = R2 + R1 * cosT;   // distance from torus centre
            float cy = R1 * sinT;

            /* Apply rotation A (around X) then B (around Z) */
            // After rotation A:
            float x = cx * (cosB * cosP + sinA * sinB * sinP)
                    - cy *  cosA * sinB;
            float y = cx * (sinB * cosP - sinA * cosB * sinP)
                    + cy *  cosA * cosB;
            float z = K2 + cosA * cx * sinP + cy * sinA;

            float ooz = 1.0f / z;   // "one over z" — used for depth test

            /* ── Project to 2-D screen ───────────────────── */
            int px = (int)(W / 2 + K1 * ooz * x);
            int py = (int)(H / 2 - K1 * ooz * y * 0.45f); // 0.45 corrects aspect ratio

            if (px < 0 || px >= W || py < 0 || py >= H) continue;

            /* ── Compute surface normal & luminance ──────── */
            float L = cosP * cosT * sinB
                    - cosA * cosT * sinP
                    - sinA * sinT
                    + cosB * (cosA * sinT - cosT * sinA * sinP);

            /* Depth test */
            if (ooz > zbuf[py][px]) {
                zbuf[py][px] = ooz;
                int lum_idx = (int)(L * 8.0f);
                /* L can be negative (back-facing); clamp to dimmest shade */
                screen[py][px] = (lum_idx > 0) ? PALETTE[lum_idx % NSHADES] : '.';
            }
        }
    }

    /* ── Print framebuffer ───────────────────────────────── */
    // Move cursor to top-left without clearing (flicker-free)
    fputs("\x1b[H", stdout);
    for (int y = 0; y < H; ++y) {
        puts(screen[y]);
    }
    fflush(stdout);
}

/* ────────────────────────────────────────────────────────────
 *  main
 * ──────────────────────────────────────────────────────────── */
int main()
{
    /* Hide cursor, clear screen */
    fputs("\x1b[?25l\x1b[2J", stdout);

    float A = 0.0f, B = 0.0f;

    for (;;) {
        render_frame(A, B);
        A += 0.07f;   // spin speed around X
        B += 0.03f;   // spin speed around Z
        usleep(30000); // ~33 fps
    }

    /* Restore cursor (unreachable without Ctrl-C, but good practice) */
    fputs("\x1b[?25h", stdout);
    return 0;
}
