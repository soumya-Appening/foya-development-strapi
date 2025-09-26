import type { Schema, Struct } from '@strapi/strapi';

export interface SharedAboutSection extends Struct.ComponentSchema {
  collectionName: 'components_shared_about_sections';
  info: {
    displayName: 'About Section';
    icon: 'bold';
  };
  attributes: {
    description: Schema.Attribute.Text;
    image: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    title: Schema.Attribute.String;
  };
}

export interface SharedContactDetail extends Struct.ComponentSchema {
  collectionName: 'components_shared_contact_details';
  info: {
    displayName: 'Contact Detail';
    icon: 'envelop';
  };
  attributes: {
    label: Schema.Attribute.String;
    value: Schema.Attribute.String;
    valueRich: Schema.Attribute.Blocks;
  };
}

export interface SharedContactInfo extends Struct.ComponentSchema {
  collectionName: 'components_shared_contact_infos';
  info: {
    displayName: 'Contact Info';
    icon: 'phone';
  };
  attributes: {
    contactDetails: Schema.Attribute.Component<'shared.contact-detail', true>;
  };
}

export interface SharedCta extends Struct.ComponentSchema {
  collectionName: 'components_shared_ctas';
  info: {
    displayName: 'CTA';
    icon: 'apps';
  };
  attributes: {
    buttonLink: Schema.Attribute.String;
    buttonText: Schema.Attribute.String;
    description: Schema.Attribute.Blocks;
    title: Schema.Attribute.String;
  };
}

export interface SharedDynamicDetails extends Struct.ComponentSchema {
  collectionName: 'components_shared_dynamic_details';
  info: {
    displayName: 'Job Details';
  };
  attributes: {
    description: Schema.Attribute.Blocks;
    title: Schema.Attribute.String;
  };
}

export interface SharedDynamicSection extends Struct.ComponentSchema {
  collectionName: 'components_shared_dynamic_sections';
  info: {
    displayName: 'Dynamic Section';
    icon: 'book';
  };
  attributes: {
    btnLink: Schema.Attribute.String;
    btnText: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    image: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    title: Schema.Attribute.String;
  };
}

export interface SharedFilters extends Struct.ComponentSchema {
  collectionName: 'components_shared_filters';
  info: {
    displayName: 'Filters';
  };
  attributes: {
    filters: Schema.Attribute.Component<'shared.project-filter', true>;
  };
}

export interface SharedFooter extends Struct.ComponentSchema {
  collectionName: 'components_shared_footers';
  info: {
    displayName: 'Footer';
    icon: 'strikeThrough';
  };
  attributes: {
    btnLink: Schema.Attribute.Text;
    btnText: Schema.Attribute.String;
    content: Schema.Attribute.Text;
  };
}

export interface SharedGallery extends Struct.ComponentSchema {
  collectionName: 'components_shared_galleries';
  info: {
    displayName: 'Gallery';
    icon: 'picture';
  };
  attributes: {
    images: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    title: Schema.Attribute.String;
  };
}

export interface SharedHeader extends Struct.ComponentSchema {
  collectionName: 'components_shared_headers';
  info: {
    displayName: 'Header';
    icon: 'bold';
  };
  attributes: {
    headerNavigations: Schema.Attribute.Component<
      'shared.header-navigation',
      true
    >;
    logo: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
  };
}

export interface SharedHeaderNavigation extends Struct.ComponentSchema {
  collectionName: 'components_shared_header_navigations';
  info: {
    displayName: 'Header Navigation';
    icon: 'code';
  };
  attributes: {
    navigations: Schema.Attribute.Component<'shared.navigation-link', true>;
  };
}

export interface SharedHero extends Struct.ComponentSchema {
  collectionName: 'components_shared_heroes';
  info: {
    displayName: 'Hero';
    icon: 'grid';
  };
  attributes: {
    backgroundImage: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    buttonLink: Schema.Attribute.String;
    buttonText: Schema.Attribute.String;
    subtitle: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface SharedHeroBanners extends Struct.ComponentSchema {
  collectionName: 'components_shared_hero_banners';
  info: {
    displayName: 'hero-banners';
    icon: 'dashboard';
  };
  attributes: {
    bannerImage: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    link: Schema.Attribute.String;
    subTitle: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface SharedMedia extends Struct.ComponentSchema {
  collectionName: 'components_shared_media';
  info: {
    displayName: 'Media';
    icon: 'file-video';
  };
  attributes: {};
}

export interface SharedNavigationLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_navigation_links';
  info: {
    displayName: 'Navigation Link';
    icon: 'book';
  };
  attributes: {
    link: Schema.Attribute.String;
    name: Schema.Attribute.String;
  };
}

export interface SharedPress extends Struct.ComponentSchema {
  collectionName: 'components_shared_presses';
  info: {
    displayName: 'Press';
  };
  attributes: {
    pressItem: Schema.Attribute.Component<'shared.press-item', true>;
  };
}

export interface SharedPressItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_press_items';
  info: {
    displayName: 'Press Item';
    icon: 'book';
  };
  attributes: {
    date: Schema.Attribute.DateTime;
    link: Schema.Attribute.String;
    shortDescription: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface SharedProjectDetailsSections extends Struct.ComponentSchema {
  collectionName: 'components_shared_project_details_sections';
  info: {
    displayName: 'Project Details Sections';
  };
  attributes: {
    description: Schema.Attribute.Blocks;
    title: Schema.Attribute.String;
  };
}

export interface SharedProjectFilter extends Struct.ComponentSchema {
  collectionName: 'components_shared_project_filters';
  info: {
    displayName: 'Project Filter';
    icon: 'attachment';
  };
  attributes: {
    name: Schema.Attribute.String;
    slug: Schema.Attribute.String;
  };
}

export interface SharedQuote extends Struct.ComponentSchema {
  collectionName: 'components_shared_quotes';
  info: {
    displayName: 'Quote';
    icon: 'indent';
  };
  attributes: {
    body: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface SharedRichText extends Struct.ComponentSchema {
  collectionName: 'components_shared_rich_texts';
  info: {
    description: '';
    displayName: 'Rich text';
    icon: 'align-justify';
  };
  attributes: {
    body: Schema.Attribute.RichText;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: '';
    displayName: 'Seo';
    icon: 'allergies';
    name: 'Seo';
  };
  attributes: {
    metaDescription: Schema.Attribute.Text & Schema.Attribute.Required;
    metaTitle: Schema.Attribute.String & Schema.Attribute.Required;
    shareImage: Schema.Attribute.Media<'images'>;
  };
}

export interface SharedSlider extends Struct.ComponentSchema {
  collectionName: 'components_shared_sliders';
  info: {
    description: '';
    displayName: 'Slider';
    icon: 'address-book';
  };
  attributes: {
    files: Schema.Attribute.Media<'images', true>;
  };
}

export interface SharedSocialLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_social_links';
  info: {
    displayName: 'Social Link';
    icon: 'discuss';
  };
  attributes: {
    icon: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    platform: Schema.Attribute.String;
    url: Schema.Attribute.String;
  };
}

export interface SharedTeam extends Struct.ComponentSchema {
  collectionName: 'components_shared_teams';
  info: {
    displayName: 'Team';
    icon: 'user';
  };
  attributes: {};
}

export interface SharedTeamMember extends Struct.ComponentSchema {
  collectionName: 'components_shared_team_members';
  info: {
    displayName: 'Team Member';
    icon: 'user';
  };
  attributes: {
    bio: Schema.Attribute.Blocks;
    name: Schema.Attribute.String;
    photo: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    role: Schema.Attribute.String;
  };
}

export interface SharedVideoBlock extends Struct.ComponentSchema {
  collectionName: 'components_shared_video_blocks';
  info: {
    displayName: 'Video Block';
    icon: 'television';
  };
  attributes: {
    title: Schema.Attribute.String;
    videoUrl: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'shared.about-section': SharedAboutSection;
      'shared.contact-detail': SharedContactDetail;
      'shared.contact-info': SharedContactInfo;
      'shared.cta': SharedCta;
      'shared.dynamic-details': SharedDynamicDetails;
      'shared.dynamic-section': SharedDynamicSection;
      'shared.filters': SharedFilters;
      'shared.footer': SharedFooter;
      'shared.gallery': SharedGallery;
      'shared.header': SharedHeader;
      'shared.header-navigation': SharedHeaderNavigation;
      'shared.hero': SharedHero;
      'shared.hero-banners': SharedHeroBanners;
      'shared.media': SharedMedia;
      'shared.navigation-link': SharedNavigationLink;
      'shared.press': SharedPress;
      'shared.press-item': SharedPressItem;
      'shared.project-details-sections': SharedProjectDetailsSections;
      'shared.project-filter': SharedProjectFilter;
      'shared.quote': SharedQuote;
      'shared.rich-text': SharedRichText;
      'shared.seo': SharedSeo;
      'shared.slider': SharedSlider;
      'shared.social-link': SharedSocialLink;
      'shared.team': SharedTeam;
      'shared.team-member': SharedTeamMember;
      'shared.video-block': SharedVideoBlock;
    }
  }
}
