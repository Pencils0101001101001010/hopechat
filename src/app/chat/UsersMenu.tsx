import { useEffect, useState } from "react";
import {
  Avatar,
  useChatContext,
  LoadingChannels as LoadingUsers,
} from "stream-chat-react";
import { UserResource } from "@clerk/types";
import { Channel, UserResponse } from "stream-chat";
import { ArrowLeft } from "lucide-react";
import LoadingButton from "../components/LoadingButton";
import { Input } from "postcss";
import useDebounce from "@/hooks/useDebounce";
import Button from "../components/Button";

interface UsersMenuProps {
  loggedInUser: UserResource;
  onClose: () => void;
  onChannelSelected: () => void;
}

export default function UsersMenu({
  loggedInUser,
  onClose,
  onChannelSelected,
}: UsersMenuProps) {
  const { client, setActiveChannel } = useChatContext();
  const [users, setUsers] = useState<(UserResponse & { image?: string })[]>();

  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const [searchInput, setSearchInput] = useState("");

  const searchInputDebounced = useDebounce(searchInput);

  const [moreUsersLoading, setMoreUsersLoading] = useState(false);

  const [endOfPaginationReached, setEndOfPaginationReached] =
    useState<boolean>();

  const pageSize = 10;

  useEffect(() => {
    async function loadInitialUsers() {
      setUsers(undefined);
      setEndOfPaginationReached(undefined);
      // await new Promise((resolve) => setTimeout(resolve, 1000));

      try {
        const response = await client.queryUsers(
          {
            id: { $ne: loggedInUser.id },
            ...(searchInputDebounced
              ? {
                  $or: [
                    { name: { $autocomplete: searchInputDebounced } },
                    { id: { $autocomplete: searchInputDebounced } },
                  ],
                }
              : {}),
          },
          { id: 1 },
          { limit: pageSize + 1 }
        );
        setUsers(response.users.slice(0, pageSize));
        setEndOfPaginationReached(response.users.length <= pageSize);
      } catch (error) {
        console.error(error);
        alert("error loading users");
      }
    }
    loadInitialUsers();
  }, [client, loggedInUser.id, searchInputDebounced]);

  async function loadMoreUsers() {
    setMoreUsersLoading(true);

    // await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      const lastUserId = users?.[users.length - 1].id;
      if (!lastUserId) return;
      const response = await client.queryUsers(
        {
          $and: [
            { id: { $ne: loggedInUser.id } },
            { id: { $gt: lastUserId } },
            searchInputDebounced
              ? {
                  $or: [
                    { name: { $autocomplete: searchInputDebounced } },
                    { id: { $autocomplete: searchInputDebounced } },
                  ],
                }
              : {},
          ],
        },
        { id: 1 },
        { limit: pageSize + 1 }
      );

      setUsers([...users, ...response.users.slice(0, pageSize)]);
      setEndOfPaginationReached(response.users.length <= pageSize);
    } catch (error) {
      console.error(error);
      alert("error loading users");
    } finally {
      setMoreUsersLoading(false);
    }
  }

  function handleChannelSelected(channel: Channel) {
    setActiveChannel(channel);
    onChannelSelected();
  }

  async function startChatWithUser(userId: string) {
    try {
      const channel = client.channel("messaging", {
        members: [userId, loggedInUser.id],
      });
      await channel.create();
      handleChannelSelected(channel);
    } catch (error) {
     
    }
  }

  async function startGroupChat(members: string[], name?: string) {
    try {
      const channel = client.channel("messaging", {
        members,
        name,
      });
      await channel.create();
      handleChannelSelected(channel);
    } catch (error) {
       console.error(error);
      alert("error loading Group");
    }
  }

  return (
    <div className="overflow-y-auto str-chat absolute z-10 h-full w-full  border-e border-e-[#DBDDE1] bg-white dark:border-e-gray-800 dark:bg-[#17191c]">
      <div className="flex flex-col p-3">
        <div className="hover:sh mb-3 flex items-center gap-3 text-xl font-bold">
          <ArrowLeft onClick={onClose} className="cursor-pointer" />
          Users
        </div>
        <input
          type="search"
          placeholder="Search"
          className="rounded-full border border-gray-300 px-4 py-2 bg-transparent dark:border-gray-800 dark:text-white"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>
      {selectedUsers.length > 0 && (
        <StartGroupChatHeader 
        onConfirm={(name) => startGroupChat([loggedInUser.id, ...selectedUsers], name)}
        onClearSelection={() => setSelectedUsers([])}
        />
      )}
      <div>
        {users?.map((user) => (
          <UserResult
            user={user}
            onUserClicked={startChatWithUser}
            selected={selectedUsers.includes(user.id)}
            onChangeSelected={(selected) => setSelectedUsers(
              selected 
              ? [...selectedUsers, user.id]
              : selectedUsers.filter(userId => userId !== user.id)
            )}
            key={user.id}
          />
        ))}
       
        <div className="px-3">
          {!users && !searchInputDebounced && <LoadingUsers />}
          {!users && searchInputDebounced && "Searching..."}
          {users?.length === 0 && <div>No users found</div>}
        </div>
        {endOfPaginationReached === false && (
          <LoadingButton
            onClick={loadMoreUsers}
            loading={moreUsersLoading}
            className="m-auto mb-3 w-[80%]"
          >
            Load more users
          </LoadingButton>
        )}
      </div>
    </div>
  );
}

interface UserResultProps {
  user: UserResponse & { image?: string };
  onUserClicked: (userId: string) => void;
  selected?: boolean;
  onChangeSelected: (selected: boolean) => void;
}

function UserResult({ user, onUserClicked, selected, onChangeSelected }: UserResultProps) {
  return (
    <button
      className="mb-3 w-full items-center gap-2 p-2 hover:bg-slate-300 dark:hover:bg-[#1c1e22]"
      onClick={() => onUserClicked(user.id)}
    >
      <input 
      title="check"
      checked={selected}
      onChange={(e) => onChangeSelected(e.target.checked)}
      onClick={(e) => e.stopPropagation()}
      type="checkbox"
      className="flex justify-start mx-1 my-1 scale-125 bg-transparent"
      />
      <span>
       
        <Avatar image={user.image} name={user.name || user.id} size={40} />
      </span>
      <span className="overflow-hidden text-ellipsis whitespace-nowrap">
        {user.name || user.id}
      </span>
      {user.online && <span className="text-xs text-green-500">Online</span>} 
    </button>
  );
}

interface StartGroupChatHeaderProps {
  onConfirm: (name?: string) => void;
  onClearSelection: () => void; 
}


function StartGroupChatHeader({onConfirm, onClearSelection}: StartGroupChatHeaderProps) {
  const [groupChatNameInput, setGroupChatNameInput] = useState("");

  return(
    <div className="sticky top-0 z-10 flex flex-col gap-3 bg-white p-3 shadow-sm dark:text-white dark:bg-black">
        <input 
        placeholder="Group Name"
        className="rounded border border-gray-300 p-2 bg-transparent"
        value={groupChatNameInput}
        onChange={(e) => setGroupChatNameInput(e.target.value)}
        />
        <div className="flex justify-center gap-2">
          <Button 
          onClick={() => onConfirm(groupChatNameInput)} 
          className="py-2"
         >Start Group Chat</Button>
          <Button
          onClick={onClearSelection} className="bg-gray-400 active:bg-slate-500 py-2"
          >
              Clear Selected
          </Button>
        </div>
    </div>
  )

}
