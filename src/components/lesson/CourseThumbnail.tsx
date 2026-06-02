import { useWindowDimensions, View } from "react-native";

import { IllustrationScene } from "@/components/lesson/illustrations/IllustrationScene";
import type { CourseId } from "@/data/courses";
import { COURSE_DEFAULT_IMAGE, type LessonImageKey } from "@/data/lesson-images";

type Props = {
  courseId: CourseId;
  /** Override course default art (e.g. per-lesson on syllabus). */
  imageKey?: LessonImageKey;
  /** Width in px; ignored when `fullBleed` */
  size?: number;
  rounded?: number;
  /** Span card width (course detail hero). */
  fullBleed?: boolean;
  animate?: boolean;
};

export function CourseThumbnail({
  courseId,
  imageKey,
  size = 52,
  rounded = 12,
  fullBleed = false,
  animate = true,
}: Props) {
  const { width: screenW } = useWindowDimensions();
  const w = fullBleed ? Math.max(screenW - 40, 280) : size;
  const height = Math.round(w * 0.62);
  const key = imageKey ?? COURSE_DEFAULT_IMAGE[courseId];

  return (
    <View
      style={{
        width: w,
        height,
        borderRadius: fullBleed ? 0 : rounded,
        overflow: "hidden",
        borderWidth: fullBleed ? 0 : 1,
        borderColor: "#EAEDE8",
        backgroundColor: "#F7F9F5",
        alignSelf: fullBleed ? "stretch" : "flex-start",
      }}
    >
      <IllustrationScene variant={key} width={w} height={height} animate={animate} />
    </View>
  );
}
