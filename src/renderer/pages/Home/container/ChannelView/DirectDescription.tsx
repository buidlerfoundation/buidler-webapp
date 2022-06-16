import { useSelector } from 'react-redux';
import api from 'renderer/api';
import NormalButton from 'renderer/components/NormalButton';
import { createMemberChannelData } from 'renderer/helpers/ChannelHelper';
import './index.scss';

type DirectDescriptionProps = {
  currentChannel: any;
  teamId: string;
};

const DirectDescription = ({
  currentChannel,
  teamId,
}: DirectDescriptionProps) => {
  const userData = useSelector((state: any) => state.user.userData);
  const createDirectChannel = async () => {
    const members = [{ user_id: currentChannel.user.user_id }];
    if (userData.user_id !== currentChannel.user.user_id) {
      members.push({ user_id: userData.user_id });
    }
    const { res } = await createMemberChannelData(members);
    const body: any = {
      channel_type: 'Direct',
      channel_member_data: res,
    };
    const result = await api.createChannel(teamId, body);
    console.log(result);
  };
  return (
    <div className="direct-description__container">
      <span className="title">Direct Message</span>
      <span className="description">
        • End-to-end encryption.
        <br />• Do not allow forwarding.
        <br />• What happens between us stays with us.
        <br />
        <br />
        <div>
          <span className="link">Read more</span>
        </div>
      </span>
      <div style={{ height: 50 }} />
      <NormalButton
        title="Start Direct Message"
        type="main"
        onPress={createDirectChannel}
      />
    </div>
  );
};

export default DirectDescription;
