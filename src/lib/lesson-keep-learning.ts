import type { ConceptId } from "@/data/concepts";
import type { Lesson } from "@/data/courses";
import {
  collectConceptIdsFromLesson,
  khanForConcept,
  type LearningResource,
} from "@/data/learning-resources";
import { youtubeForConcept, type YoutubeVideo } from "@/data/youtube-resources";

function youtubeToResource(v: YoutubeVideo, suffix: string): LearningResource {
  return {
    id: `yt-${v.videoId}-${suffix}`,
    provider: "youtube",
    title: v.title,
    channel: v.channel,
    url: `https://www.youtube.com/watch?v=${v.videoId}`,
    duration: v.duration,
  };
}

/** Up to 6 curated resources for the lesson wrap-up screen. */
export function keepLearningForLesson(lesson: Lesson): LearningResource[] {
  const concepts = collectConceptIdsFromLesson(lesson);
  const seen = new Set<string>();
  const out: LearningResource[] = [];

  const add = (r: LearningResource) => {
    if (seen.has(r.url)) return;
    seen.add(r.url);
    out.push(r);
  };

  for (const conceptId of concepts) {
    for (const v of youtubeForConcept(conceptId).slice(0, 1)) {
      add(youtubeToResource(v, conceptId));
    }
    for (const k of khanForConcept(conceptId).slice(0, 1)) {
      add(k);
    }
    if (out.length >= 6) break;
  }

  return out.slice(0, 6);
}

export function keepLearningForConcept(conceptId: ConceptId): LearningResource[] {
  return [
    ...youtubeForConcept(conceptId).map((v, i) => youtubeToResource(v, String(i))),
    ...khanForConcept(conceptId),
  ].slice(0, 4);
}
