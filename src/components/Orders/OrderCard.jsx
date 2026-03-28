import React, { useState } from "react";
import { 
  Box, 
  ArrowRight, 
  Calendar, 
  Truck, 
  Weight, 
  Maximize2, 
  ChevronDown, 
  CircleDollarSign, 
  Info 
} from "lucide-react";
import styles from "./OrderCard.module.scss";

const OrderCard = ({ order, onClick, actionButton }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusLabel = (status) => {
    switch (status) {
      case "PUBLISHED": return "Опубликован";
      case "NEGOTIATION": return "Ждем офера";
      case "APPROVED": return "Принят";
      case "IN_TRANSIT": return "В пути";
      case "DELIVERED": return "Завершен";
      default: return status;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "NEGOTIATION": return styles.statusPending;
      case "IN_TRANSIT": return styles.statusActive;
      case "DELIVERED": return styles.statusCompleted;
      case "APPROVED": return styles.statusApproved;
      case "PUBLISHED": return styles.statusPublished;
      default: return styles.statusDefault;
    }
  };

  const handleCardClick = () => {
    setIsExpanded(!isExpanded);
  };

  const handleButtonClick = (e) => {
    e.stopPropagation();
    if (onClick) onClick();
  };

  // Extract data safely
  const cargo = order.cargoDetails?.description || order.cargo || "Груз";
  const weight = order.cargoDetails?.weight || order.weight;
  const volume = order.cargoDetails?.volume || order.volume;
  const price = order.pricing?.customerOffer || order.price;
  const currency = order.pricing?.currency || "RUB";
  const description = order.cargoDetails?.description || order.description;
  
  // Format price
  const formattedPrice = price 
    ? new Intl.NumberFormat('ru-RU', { style: 'currency', currency: currency, maximumFractionDigits: 0 }).format(price)
    : "Договорная";

  return (
    <div className={`${styles.orderCard} ${isExpanded ? styles.expanded : ''}`}>
      <div className={styles.cardMain} onClick={handleCardClick}>
        <div className={styles.cardHeader}>
          <div className={styles.iconBox}>
            <Box size={20} strokeWidth={2} />
          </div>
          <div className={styles.routeInfo}>
            <div className={styles.route}>
              <span className={styles.city}>{order.route?.from?.city || order.from || "Откуда"}</span>
              <ArrowRight size={16} className={styles.arrow} />
              <span className={styles.city}>{order.route?.to?.city || order.to || "Куда"}</span>
            </div>
            <div className={styles.subInfo}>
              <span className={styles.date}>
                <Calendar size={12} />
                {new Date(order.createdAt).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long'
                })}
              </span>
            </div>
          </div>
          <div className={`${styles.statusBadge} ${getStatusClass(order.status)}`}>
            {getStatusLabel(order.status)}
          </div>
        </div>
        
        <div className={styles.expandIcon}>
          <ChevronDown size={20} />
        </div>
      </div>

      <div className={styles.expandedContent}>
        <div className={styles.divider} />
        <div className={styles.detailsGrid}>
          <div className={styles.detailItem}>
            <span className={styles.label}>Груз</span>
            <div className={styles.value}>
              <Truck size={14} />
              <span className={styles.valueText}>{cargo}</span>
            </div>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.label}>Вес</span>
            <div className={styles.value}>
              <Weight size={14} />
              <span className={styles.valueText}>{weight ? `${weight} т` : "—"}</span>
            </div>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.label}>Объем</span>
            <div className={styles.value}>
              <Maximize2 size={14} />
              <span className={styles.valueText}>{volume ? `${volume} м³` : "—"}</span>
            </div>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.label}>Ставка</span>
            <div className={styles.value}>
              <CircleDollarSign size={14} />
              <span className={styles.valueText}>{formattedPrice}</span>
            </div>
          </div>
        </div>

        {description && (
          <div className={styles.description}>
            <Info size={14} className={styles.descIcon} />
            <p>{description}</p>
          </div>
        )}

        {actionButton ? (
          <div onClick={(e) => e.stopPropagation()}>
            {actionButton}
          </div>
        ) : (
          <button className={styles.viewOrderButton} onClick={handleButtonClick}>
            Перейти к заказу
            <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderCard;
