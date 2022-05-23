const SideBarData = {
  groups: [
    // {
    //   title: 'GENERAL',
    //   id: 0,
    //   child: [
    //     { title: 'general', id: 0 },
    //     { title: 'new_members', id: 1 },
    //     { title: 'today_i_build', id: 2 },
    //   ],
    //   type: 'text',
    // },
    // {
    //   title: 'PROJECT',
    //   id: 1,
    //   child: [
    //     { title: 'desktop_app', id: 0 },
    //     { title: 'ios_app', id: 1 },
    //     { title: 'landing_page', id: 2 },
    //   ],
    //   type: 'text',
    // },
    // {
    //   title: 'TASK',
    //   id: 2,
    //   type: 'task',
    //   child: [
    //     { title: 'backlog', id: 0 },
    //     { title: 'doing', id: 1 },
    //     { title: 'urgent', id: 2 },
    //     { title: 'done', id: 3 },
    //   ],
    // },
    {
      title: 'MEMBER',
      id: 3,
      type: 'user',
      child: [
        {
          username: 'Hoang Nguyen',
          id: 0,
          status: 'online',
          avatar:
            'https://file.tinnhac.com/resize/600x-/2021/03/04/20210304112348-7865.jpg',
        },
        {
          username: 'Hung Nguyen',
          id: 1,
          status: 'silent',
          avatar: 'https://pbs.twimg.com/media/EIfSFWlWwAAOLmL.jpg',
        },
        {
          username: 'Khanh Hung Nguyen',
          id: 2,
          status: 'offline',
          avatar:
            'https://file.tinnhac.com/resize/600x-/2021/03/04/20210304112348-7865.jpg',
        },
      ],
    },
    // {
    //   title: 'MEETING',
    //   id: 4,
    //   child: [{ title: 'desktop_app', id: 0 }],
    //   type: 'voice',
    // },
    // {
    //   title: 'CALENDAR',
    //   id: 5,
    //   type: 'date',
    // },
  ],
};

export default SideBarData;
