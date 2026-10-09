/**
 * Turns Torre's raw responses into the clean shapes the frontend uses.
 *
 * Torre's data has a few quirks this module hides from the frontend:
 *  - Search results mix people and organizations.
 *  - A person's skills are called "strengths", and their proficiency is a word
 *    ("novice", "expert", ...) rather than a number.
 *  - `stats` holds counts (e.g. { strengths: 93 }), not lists.
 */

import { capitalizeText, decodeHtmlEntities } from '../utils/text.js';

// Torre's proficiency levels mapped to a 0-1 scale so they can be compared.
const PROFICIENCY_LEVELS = {
  master: 1,
  expert: 0.8,
  proficient: 0.6,
  novice: 0.4,
  'no-experience-interested': 0.1,
};

export const proficiencyToLevel = (proficiency) => PROFICIENCY_LEVELS[proficiency] ?? 0.3;

/**
 * Search results include organizations; only people have a username and no organizationId.
 */
export const isPerson = (entity) => Boolean(entity?.username) && !entity.organizationId;

/**
 * Minimal person info, used for search results, comparison cards and recommendations.
 */
export const toPersonSummary = (entity) => ({
  id: entity.ardaId || entity.ggId || entity.id || entity.username,
  username: entity.username,
  name: entity.name || 'Unknown User',
  professionalHeadline: decodeHtmlEntities(entity.professionalHeadline),
  picture: entity.imageUrl || entity.picture || null,
  verified: Boolean(entity.verified),
  location: entity.location ? formatLocation(entity.location) : null,
  weight: entity.weight ?? null,
  completion: entity.completion ?? null,
});

const toSkill = (strength) => ({
  id: strength.id,
  code: strength.code ?? strength.name.toLowerCase().replace(/\s+/g, '-'),
  name: strength.name,
  proficiency: strength.proficiency || null,
  level: proficiencyToLevel(strength.proficiency),
  weight: strength.weight || 0,
  recommendations: strength.recommendations || 0,
});

/**
 * A person's skills, strongest first.
 */
export const extractSkills = (genome) =>
  (genome?.strengths || [])
    .filter((strength) => strength?.name)
    .map(toSkill)
    .sort((a, b) => b.level - a.level || b.weight - a.weight);

const formatLocation = (location) => ({
  name: location.name,
  shortName: location.shortName,
  country: location.country,
  timezone: location.timezone,
});

const detectPlatform = (url = '') => {
  const platforms = ['linkedin', 'github', 'twitter', 'instagram', 'facebook', 'youtube',
    'behance', 'dribbble', 'medium', 'stackoverflow'];
  const lower = url.toLowerCase();
  if (lower.includes('x.com')) return 'twitter';
  return platforms.find((platform) => lower.includes(platform)) || 'website';
};

const sortMostRecentFirst = (a, b) => {
  const currentYear = new Date().getFullYear();
  return (Number(b.toYear) || currentYear) - (Number(a.toYear) || currentYear);
};

const formatTimelineEntry = (entry) => ({
  id: entry.id,
  name: capitalizeText(entry.name),
  category: capitalizeText(entry.category),
  fromMonth: entry.fromMonth,
  fromYear: entry.fromYear,
  toMonth: entry.toMonth,
  toYear: entry.toYear,
  summary: capitalizeText(decodeHtmlEntities(entry.additionalInfo)),
  organizations: (entry.organizations || []).map((org) => ({
    id: org.id,
    name: org.name,
    picture: org.picture,
  })),
  responsibilities: (entry.responsibilities || []).map(capitalizeText),
  remote: Boolean(entry.remote),
  highlighted: Boolean(entry.highlighted),
  verifications: entry.verifications || 0,
  recommendations: entry.recommendations || 0,
});

/**
 * Full profile, used by the genome page.
 */
export const toProfile = (genome) => {
  const person = genome?.person || {};
  const skills = extractSkills(genome);

  return {
    person: {
      ...toPersonSummary({ ...person, username: person.publicId }),
      summaryOfBio: decodeHtmlEntities(person.summaryOfBio),
      remote: Boolean(person.flags?.remoter),
    },
    // Skills rated "no-experience-interested" are things the person wants to learn.
    strengths: skills.filter((skill) => skill.proficiency !== 'no-experience-interested'),
    interests: [
      ...skills.filter((skill) => skill.proficiency === 'no-experience-interested'),
      ...(genome?.interests || []).filter((interest) => interest?.name).map(toSkill),
    ],
    experiences: (genome?.jobs || []).map(formatTimelineEntry).sort(sortMostRecentFirst),
    education: (genome?.education || []).map(formatTimelineEntry).sort(sortMostRecentFirst),
    languages: (genome?.languages || []).map((language) => ({
      language: capitalizeText(language.language),
      fluency: capitalizeText(language.fluency || 'unknown'),
    })),
    awards: genome?.awards || [],
    projects: genome?.projects || [],
    publications: genome?.publications || [],
    links: (person.links || [])
      .filter((link) => link.address)
      .map((link) => ({
        id: link.id,
        name: link.name,
        address: link.address,
        platform: detectPlatform(link.address),
      })),
    stats: genome?.stats || {},
  };
};
