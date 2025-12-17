import { FC, useMemo, useCallback, useRef, useEffect, useState } from "react";
import { Virtuoso, VirtuosoHandle, ListRange } from "react-virtuoso";
import { MessageItem } from "@/entities/message/ui/MessageItem";
import { Message } from "@/entities/message/ui/MessageItem/types";
import { useChatStore } from "@/entities/chat/model/chatStore";
import { MessageLoader } from "@/shared/ui";

interface VirtualizedMessageListProps {
  messages: Message[];
  chatId: string;
}

export const VirtualizedMessageList: FC<VirtualizedMessageListProps> = ({
  messages,
  chatId,
}) => {
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const previousMessagesLengthRef = useRef(0);

  const [viewportHeight, setViewportHeight] = useState(0);

  const scrollOffsetRef = useRef<number | null>(null);
  const isScrollingToPreservePositionRef = useRef(false);
  const previousScrollHeightRef = useRef<number | null>(null);
  const loadMoreTriggeredRef = useRef(false);
  const loadNewerTriggeredRef = useRef(false);
  const rangeRef = useRef<ListRange | null>(null);

  const {
    isLoadingMoreMessages,
    isLoadingNewerMessages,
    hasMoreMessages,
    hasNewerMessages,
    loadMoreMessages,
    loadNewerMessages,
  } = useChatStore((state) => state);

  // мок функция сортировки сообщений, можно запрашивать с бэка уже отсортированные сообщения
  const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) => a.timestamp - b.timestamp);
  }, [messages]);

  // Отслеживаем размеры viewport для динамического overscan
  useEffect(() => {
    const updateViewportSize = () => {
      if (containerRef.current) {
        setViewportHeight(containerRef.current.clientHeight);
      }
    };

    updateViewportSize();
    const resizeObserver = new ResizeObserver(updateViewportSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Вычисляем динамический overscan на основе высоты viewport
  // Overscan = дополнительная область рендеринга для плавности скролла
  // Зависит от фактической высоты экрана, а не от фиксированного значения
  const overscan = useMemo(() => {
    if (viewportHeight === 0) return 200;
    // Overscan составляет примерно 50-70% от высоты viewport
    // Это обеспечивает плавность скролла при разной высоте экрана
    const overscanValue = Math.max(200, Math.floor(viewportHeight * 0.6));
    return overscanValue;
  }, [viewportHeight]);

  // Сохраняем позицию скролла при подгрузке старых сообщений
  // Используем более точный метод через scrollHeight
  useEffect(() => {
    const currentLength = sortedMessages.length;
    const previousLength = previousMessagesLengthRef.current;

    // Если количество сообщений увеличилось и мы загружали старые сообщения
    if (
      currentLength > previousLength &&
      isLoadingMoreMessages === false &&
      scrollOffsetRef.current !== null &&
      !isScrollingToPreservePositionRef.current &&
      previousScrollHeightRef.current !== null
    ) {
      isScrollingToPreservePositionRef.current = true;

      // Используем двойной requestAnimationFrame для гарантии завершения рендера
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const container = containerRef.current?.querySelector(
            "[data-virtuoso-scroller]"
          ) as HTMLElement;
          if (
            container &&
            scrollOffsetRef.current !== null &&
            previousScrollHeightRef.current !== null
          ) {
            // Получаем текущую высоту контента
            const currentScrollHeight = container.scrollHeight;
            // Вычисляем разницу в высоте (добавленные элементы)
            const heightDifference =
              currentScrollHeight - previousScrollHeightRef.current;

            // Корректируем позицию скролла с учетом добавленных элементов
            // Это предотвращает скачки скролла
            container.scrollTop = scrollOffsetRef.current + heightDifference;
          }
          scrollOffsetRef.current = null;
          previousScrollHeightRef.current = null;
          isScrollingToPreservePositionRef.current = false;
          loadMoreTriggeredRef.current = false;
        });
      });
    }

    previousMessagesLengthRef.current = currentLength;
  }, [sortedMessages.length, isLoadingMoreMessages]);

  // Сбрасываем флаги загрузки при изменении состояния загрузки
  useEffect(() => {
    if (!isLoadingMoreMessages) {
      loadMoreTriggeredRef.current = false;
    }
    if (!isLoadingNewerMessages) {
      loadNewerTriggeredRef.current = false;
    }
  }, [isLoadingMoreMessages, isLoadingNewerMessages]);

  // Общая логика загрузки старых сообщений
  const tryLoadMore = useCallback(() => {
    if (
      !hasMoreMessages ||
      isLoadingMoreMessages ||
      loadMoreTriggeredRef.current
    ) {
      return;
    }

    loadMoreTriggeredRef.current = true;

    const container = containerRef.current?.querySelector(
      "[data-virtuoso-scroller]"
    ) as HTMLElement | null;

    if (container) {
      scrollOffsetRef.current = container.scrollTop;
      previousScrollHeightRef.current = container.scrollHeight;
    }

    loadMoreMessages(chatId);
  }, [chatId, hasMoreMessages, isLoadingMoreMessages, loadMoreMessages]);

  // Общая логика загрузки новых сообщений
  const tryLoadNewer = useCallback(() => {
    if (
      !hasNewerMessages ||
      isLoadingNewerMessages ||
      loadNewerTriggeredRef.current
    ) {
      return;
    }

    loadNewerTriggeredRef.current = true;
    loadNewerMessages(chatId);
  }, [chatId, hasNewerMessages, isLoadingNewerMessages, loadNewerMessages]);

  const handleRangeChanged = useCallback(
    (range: ListRange) => {
      rangeRef.current = range;

      const totalItems = sortedMessages.length;

      // Приближение к началу списка
      if (range.startIndex <= 5) {
        tryLoadMore();
      }

      // Приближение к концу списка
      if (range.endIndex >= totalItems - 5) {
        tryLoadNewer();
      }
    },
    [sortedMessages.length, tryLoadMore, tryLoadNewer]
  );

  const handleStartReached = useCallback(() => {
    tryLoadMore();
  }, [tryLoadMore]);

  const handleEndReached = useCallback(() => {
    tryLoadNewer();
  }, [tryLoadNewer]);

  if (sortedMessages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Нет сообщений
      </div>
    );
  }

  return (
    <div ref={containerRef} className="h-full w-full">
      <Virtuoso
        ref={virtuosoRef}
        data={sortedMessages}
        firstItemIndex={sortedMessages.length - 1}
        initialTopMostItemIndex={sortedMessages.length - 1}
        followOutput="smooth"
        startReached={handleStartReached}
        endReached={handleEndReached}
        rangeChanged={handleRangeChanged}
        // Динамический overscan на основе высоты viewport
        // Увеличиваем область рендеринга для плавности скролла
        // Значение зависит от фактической высоты экрана
        increaseViewportBy={overscan}
        // Поддержка элементов переменной высоты
        // Не используем defaultItemHeight и itemSize, чтобы react-virtuoso сам определял высоту
        // Это позволяет корректно работать с сообщениями разной высоты
        // Библиотека автоматически измеряет высоту каждого элемента при рендеринге
        // Компоненты для индикации загрузки
        components={{
          Header: () => (isLoadingMoreMessages ? <MessageLoader /> : null),
          Footer: () => (isLoadingNewerMessages ? <MessageLoader /> : null),
        }}
        itemContent={(_, message) => (
          <div className="px-4 py-2">
            <MessageItem {...message} />
          </div>
        )}
        style={{ height: "100%" }}
      />
    </div>
  );
};
