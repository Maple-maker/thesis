# Lesson illustrations

Course slides use **animated SVG scenes** (Robinhood-style minimal flat art) — not Unsplash photos.

**Important:** SVG must not wrap `Animated.View` *inside* `<Svg>` — animation runs on a parent `View` around the whole scene (`IllustrationScene` export). After changing `babel.config.js` (Reanimated plugin), restart Metro with cache clear: `npm run start:clear`.

- Renderer: `src/components/lesson/illustrations/IllustrationScene.tsx`
- Keys & mapping: `src/data/lesson-images.ts`
- Step picker: `src/lib/lesson-visuals.ts`

## Upgrading to Lottie / Rive

For richer motion (character loops, complex transitions), export `.json` (Lottie) or `.riv` from Figma + Rive or After Effects, add `lottie-react-native`, and map `LessonImageKey` → asset file. A design pass in Figma with your brand palette is the usual workflow; image-gen AI is optional for static PNG fallbacks only.

## Adding a new scene

1. Add a key to `LessonImageKey` and `ALT` in `lesson-images.ts`.
2. Implement a scene in `IllustrationScene.tsx` and register it in `SCENE_MAP`.
3. Point a course or step at the key via `COURSE_DEFAULT_IMAGE` or `imageKey` on a lesson step.
