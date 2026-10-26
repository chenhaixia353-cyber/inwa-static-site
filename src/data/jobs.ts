export interface Job {
  slug: string;
  title: string;
  titleEn: string;
  displayTitleEn: string;
  responsibilities: string[];
  requirements: string[];
}

export const recruitmentEmail = 'beijing@inwa.com.cn';

export const jobs: Job[] = [
  {
    slug: 'graphic-designer',
    title: '平面设计师',
    titleEn: 'Graphic Designer',
    displayTitleEn: 'Graphic Designer',
    responsibilities: [
      '根据项目需求或配合设计总监，完成项目的创意和设计工作',
      '正确把握设计方向，独立完成品牌、活动及展览视觉设计或其他类型的平面设计工作',
      '协助总监进行客户需求的沟通，协助完成提案文件和设计完稿工作',
      '参与客户提案，阐述创意说明',
    ],
    requirements: [
      '有三个以上独立完成的设计案例，有较强的审美素养',
      '本科及以上学历，三年以上相关工作经验，有外资工作经验者优先',
      '善于接受新鲜事物，有敏锐的创造灵感和设计洞察能力，对创意充满热情',
      '有团队协作精神，沟通能力强，工作认真严谨，积极主动，有很强的责任心',
      '熟练使用 AI、ID、PS 等设计软件，具有成熟的专业技能',
    ],
  },
  {
    slug: 'multimedia-designer',
    title: '新媒体设计师',
    titleEn: 'Multimedia Designer',
    displayTitleEn: 'Multimedia Designer',
    responsibilities: [
      '参与动画脚本创作，独立完成平面元素的动态实现',
      '独立完成视频创作、剪辑、动画创作及其他相关设计工作',
      '理解网页或 App、H5、小程序设计',
      '完成公司拟定的多媒体实验测试',
    ],
    requirements: [
      '新媒体、动画设计相关专业，本科及以上学历',
      '具有较强的审美素养、团队协作精神，积极主动，有很强的责任心',
      '熟练使用 AE、PR 等软件，对互动媒体应用技术有较强的敏感度；熟悉使用 C4D、MAYA 等 3D 软件和 AI、PS 等图形软件者优先',
      '请在简历中提供个人作品或有效链接',
    ],
  },
  {
    slug: 'space-designer',
    title: '空间设计师',
    titleEn: 'Space Designer',
    displayTitleEn: 'Space Designer',
    responsibilities: [
      '根据项目需求或配合设计总监，完成项目分析和方案设计',
      '正确把握设计方向，有效地将设计概念传达给客户',
      '负责空间设计项目过程中的效果、材质工艺把控和细部设计',
    ],
    requirements: [
      '建筑、室内、工业设计等艺术相关专业，本科及以上学历，三年以上相关工作经验者优先',
      '良好的职业素质和团队合作精神，语言能力好，工作认真严谨，积极主动，责任心强',
      '熟练掌握 AutoCAD、3ds Max、SketchUp、Photoshop、MS Program 等软件，具有成熟的专业技能和良好的审美能力',
    ],
  },
  {
    slug: 'internship-designer',
    title: '设计实习岗',
    titleEn: 'Internship Designer',
    displayTitleEn: 'Design Intern',
    responsibilities: [
      '协助资深设计师的日常工作',
      '资料搜集',
      '平面设计、空间设计及其他相关工作',
    ],
    requirements: [
      '视觉传达、广告、室内、产品设计等相关专业',
      '在校学生，每周保证至少三个工作日的工作时间',
      '具有团队协作精神，工作认真严谨，积极主动，有很强的责任心',
      '能承受压力，愿意学习和接受挑战',
      '较熟练使用设计软件，审美能力佳',
    ],
  },
];
